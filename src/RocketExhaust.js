/**
 * RocketExhaust — Multi-layer particle system for realistic rocket engine exhaust
 *
 * Architecture (5 layers):
 *   Layer 1: Hot Core        — white-hot nozzle region, tight cone
 *   Layer 2: Shock Diamonds  — bright Mach diamond pattern (additive sprites)
 *   Layer 3: Flame Body      — main orange/yellow combustion plume
 *   Layer 4: Outer Glow      — wide diffuse heat glow
 *   Layer 5: Smoke Trail     — billowing exhaust smoke, wind-affected
 */
import * as Cesium from 'cesium';
import { ENGINE_PRESETS } from './enginePresets.js';
import {
  createGlowTexture,
  createFireTexture,
  createSmokeTexture,
  createShockDiamondTexture,
  createHotCoreTexture,
} from './textures.js';

export class RocketExhaust {
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.systems = [];
    this.emitterModelMatrix = new Cesium.Matrix4();
    this.translation = new Cesium.Cartesian3();
    this.rotation = new Cesium.Quaternion();
    this.hpr = new Cesium.HeadingPitchRoll();
    this.trs = new Cesium.TranslationRotationScale();

    // Generate textures
    this._textures = {
      glow: createGlowTexture(128),
      fire: createFireTexture(128),
      smoke: createSmokeTexture(128),
      diamond: createShockDiamondTexture(64),
      hotCore: createHotCoreTexture(64),
    };

    // Default parameters
    this.params = {
      thrust: options.thrust ?? 1.0,
      plumeLength: options.plumeLength ?? 2.0,
      emissionRate: options.emissionRate ?? 300,
      smokeIntensity: options.smokeIntensity ?? 40,
      engineType: options.engineType ?? 'liquid',
    };

    this._gravityVector = new Cesium.Cartesian3();
    this._scratchCartesian = new Cesium.Cartesian3();
  }

  /**
   * Create the complete multi-layer exhaust system attached to an entity
   */
  create(entity) {
    this.entity = entity;
    this.destroy(); // Clear any previous systems
    this._buildSystems();
    return this;
  }

  /**
   * Build all particle system layers
   */
  _buildSystems() {
    const preset = ENGINE_PRESETS[this.params.engineType];
    const thrust = this.params.thrust;
    const plumeLength = this.params.plumeLength;
    const rate = this.params.emissionRate;
    const smokeIntensity = this.params.smokeIntensity / 100;

    // ──── Layer 1: Hot Core ────
    this.systems.push(this._addSystem({
      image: this._textures.hotCore,
      startColor: this._toColor(preset.core.startColor),
      endColor: this._toColor(preset.core.endColor),
      startScale: 1.0 * thrust,
      endScale: 3.0 * thrust,
      minimumParticleLife: 0.2 * plumeLength,
      maximumParticleLife: 0.5 * plumeLength,
      minimumSpeed: 25.0 * thrust,
      maximumSpeed: 50.0 * thrust,
      emissionRate: rate * 0.3,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(6.0)),
      imageSize: new Cesium.Cartesian2(18 * thrust, 18 * thrust),
      updateCallback: this._coreUpdate.bind(this),
      lifetime: 16.0,
      loop: true,
      sizeInMeters: true,
    }));

    // ──── Layer 2: Shock Diamonds (if applicable) ────
    if (preset.shockDiamonds) {
      this.systems.push(this._addSystem({
        image: this._textures.diamond,
        startColor: new Cesium.Color(1.0, 1.0, 1.0, 0.9),
        endColor: new Cesium.Color(0.8, 0.9, 1.0, 0.0),
        startScale: 0.6 * thrust,
        endScale: 1.8 * thrust,
        minimumParticleLife: 0.15 * plumeLength,
        maximumParticleLife: 0.35 * plumeLength,
        minimumSpeed: 30.0 * thrust,
        maximumSpeed: 55.0 * thrust,
        emissionRate: rate * 0.15 * (preset.shockDiamondCount / 5),
        emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(3.0)),
        imageSize: new Cesium.Cartesian2(12 * thrust, 20 * thrust),
        updateCallback: this._diamondUpdate.bind(this),
        lifetime: 16.0,
        loop: true,
        sizeInMeters: true,
      }));
    }

    // ──── Layer 3: Flame Body ────
    this.systems.push(this._addSystem({
      image: this._textures.fire,
      startColor: this._toColor(preset.flame.startColor),
      endColor: this._toColor(preset.flame.endColor),
      startScale: 2.0 * thrust,
      endScale: 6.0 * thrust * plumeLength,
      minimumParticleLife: 0.4 * plumeLength,
      maximumParticleLife: 1.0 * plumeLength,
      minimumSpeed: 18.0 * thrust,
      maximumSpeed: 35.0 * thrust,
      emissionRate: rate,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(14.0)),
      imageSize: new Cesium.Cartesian2(25 * thrust, 25 * thrust),
      updateCallback: this._flameUpdate.bind(this),
      lifetime: 16.0,
      loop: true,
      sizeInMeters: true,
    }));

    // ──── Layer 4: Outer Glow ────
    this.systems.push(this._addSystem({
      image: this._textures.glow,
      startColor: this._toColor(preset.outerGlow.startColor),
      endColor: this._toColor(preset.outerGlow.endColor),
      startScale: 4.0 * thrust,
      endScale: 14.0 * thrust * plumeLength,
      minimumParticleLife: 0.6 * plumeLength,
      maximumParticleLife: 1.5 * plumeLength,
      minimumSpeed: 12.0 * thrust,
      maximumSpeed: 25.0 * thrust,
      emissionRate: rate * 0.4,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(22.0)),
      imageSize: new Cesium.Cartesian2(35 * thrust, 35 * thrust),
      updateCallback: this._glowUpdate.bind(this),
      lifetime: 16.0,
      loop: true,
      sizeInMeters: true,
    }));

    // ──── Layer 5: Smoke Trail ────
    const smokeMult = preset.smokeIntensityMult;
    this.systems.push(this._addSystem({
      image: this._textures.smoke,
      startColor: this._toColor(preset.smoke.startColor, smokeIntensity * smokeMult),
      endColor: this._toColor(preset.smoke.endColor),
      startScale: 4.0 * thrust,
      endScale: 25.0 * thrust * plumeLength,
      minimumParticleLife: 2.0 * plumeLength,
      maximumParticleLife: 6.0 * plumeLength,
      minimumSpeed: 6.0 * thrust,
      maximumSpeed: 15.0 * thrust,
      emissionRate: rate * 0.2 * smokeIntensity * smokeMult,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(28.0)),
      imageSize: new Cesium.Cartesian2(40 * thrust, 40 * thrust),
      updateCallback: this._smokeUpdate.bind(this),
      lifetime: 16.0,
      loop: true,
      sizeInMeters: true,
    }));
  }

  /**
   * Add a single particle system to the scene
   */
  _addSystem(config) {
    const system = this.scene.primitives.add(new Cesium.ParticleSystem({
      ...config,
      modelMatrix: this._computeModelMatrix(),
      emitterModelMatrix: this._computeEmitterModelMatrix(),
    }));
    return system;
  }

  /**
   * Compute model matrix from entity position
   */
  _computeModelMatrix() {
    if (!this.entity) return Cesium.Matrix4.IDENTITY;

    const position = this.entity.position;
    if (!position) return Cesium.Matrix4.IDENTITY;

    const pos = position.getValue(this.viewer.clock.currentTime);
    if (!pos) return Cesium.Matrix4.IDENTITY;

    return Cesium.Transforms.eastNorthUpToFixedFrame(pos);
  }

  /**
   * Compute emitter model matrix (offset from entity center)
   * Points the exhaust downward (negative Z in local frame)
   */
  _computeEmitterModelMatrix() {
    this.hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0);
    this.trs.translation = Cesium.Cartesian3.fromElements(0, 0, -2.5, this.translation);
    this.trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(this.hpr, this.rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(this.trs, this.emitterModelMatrix);
  }

  /**
   * Update callback for core particles — tight, fast, bright
   */
  _coreUpdate(particle, dt) {
    // Slight random flutter
    const flutter = (Math.random() - 0.5) * 2.0;
    particle.velocity = Cesium.Cartesian3.add(
      particle.velocity,
      new Cesium.Cartesian3(flutter, flutter, 0),
      particle.velocity
    );
  }

  /**
   * Update callback for shock diamond particles — pulsing brightness
   */
  _diamondUpdate(particle, dt) {
    // Oscillate for shimmering effect
    const age = particle.age / particle.life;
    const pulse = 0.7 + 0.3 * Math.sin(age * Math.PI * 8);
    particle.imageSize = new Cesium.Cartesian2(
      particle.imageSize.x * (0.95 + 0.05 * pulse),
      particle.imageSize.y * (0.95 + 0.05 * pulse)
    );
  }

  /**
   * Update callback for flame body — turbulence
   */
  _flameUpdate(particle, dt) {
    const age = particle.age / particle.life;
    // Increasing turbulence with age
    const turbulence = age * 8.0;
    particle.velocity = Cesium.Cartesian3.add(
      particle.velocity,
      new Cesium.Cartesian3(
        (Math.random() - 0.5) * turbulence,
        (Math.random() - 0.5) * turbulence,
        (Math.random() - 0.5) * turbulence * 0.3
      ),
      particle.velocity
    );
  }

  /**
   * Update callback for glow — gentle drift
   */
  _glowUpdate(particle, dt) {
    const age = particle.age / particle.life;
    const drift = age * 3.0;
    particle.velocity = Cesium.Cartesian3.add(
      particle.velocity,
      new Cesium.Cartesian3(
        (Math.random() - 0.5) * drift,
        (Math.random() - 0.5) * drift,
        0
      ),
      particle.velocity
    );
  }

  /**
   * Update callback for smoke — gravity pull + wind + expansion
   */
  _smokeUpdate(particle, dt) {
    const age = particle.age / particle.life;

    // Gravity effect (pulls smoke down in local frame)
    Cesium.Cartesian3.fromElements(0, 0, -2.5 * age, this._gravityVector);
    particle.velocity = Cesium.Cartesian3.add(
      particle.velocity, this._gravityVector, particle.velocity
    );

    // Wind drift
    const wind = age * 4.0;
    particle.velocity = Cesium.Cartesian3.add(
      particle.velocity,
      new Cesium.Cartesian3(
        wind * 0.5 + (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0,
        0
      ),
      particle.velocity
    );

    // Slow down over time (drag)
    Cesium.Cartesian3.multiplyByScalar(particle.velocity, 0.998, particle.velocity);
  }

  /**
   * Update all systems every frame (called from render loop)
   */
  update(time) {
    if (!this.entity || this.systems.length === 0) return;

    const position = this.entity.position?.getValue(time);
    if (!position) return;

    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    const emitterMatrix = this._computeEmitterModelMatrix();

    for (const system of this.systems) {
      if (system && !system.isDestroyed()) {
        system.modelMatrix = modelMatrix;
        system.emitterModelMatrix = emitterMatrix;
      }
    }
  }

  /**
   * Live update parameters without rebuilding
   */
  updateParams(params) {
    const changed = Object.keys(params).some(k => this.params[k] !== params[k]);
    if (!changed) return;

    Object.assign(this.params, params);

    // Rebuild systems with new parameters
    if (this.entity) {
      this.destroy();
      this._buildSystems();
    }
  }

  /**
   * Clean up all particle systems
   */
  destroy() {
    for (const system of this.systems) {
      if (system && !system.isDestroyed()) {
        this.scene.primitives.remove(system);
      }
    }
    this.systems = [];
  }

  /**
   * Helper: convert [r, g, b, a] array to Cesium.Color
   */
  _toColor(arr, alphaOverride) {
    return new Cesium.Color(
      arr[0], arr[1], arr[2],
      alphaOverride !== undefined ? Math.min(alphaOverride, arr[3]) : arr[3]
    );
  }
}
