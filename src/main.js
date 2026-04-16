/**
 * CesiumFlame — Main Entry
 * Realistic rocket engine exhaust flame effect
 */
import * as Cesium from 'cesium';
import { RocketExhaust } from './RocketExhaust.js';

// ──────────────────────────────────────────
// Cesium Ion Token (demo token, replace with yours)
// ──────────────────────────────────────────
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYmMyNjY0Yy0xYmE1LTRiNTgtOGNjNy1kMjJiNGIxZTRlMTAiLCJpZCI6MjU5LCJpYXQiOjE3NDQ3MTgxODF9.pIPEolmvKJCL5_MheS4D-0Xro6eGHwGPmc26gGISKnM';

// ──────────────────────────────────────────
// Initialize Viewer
// ──────────────────────────────────────────
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  infoBox: false,
  selectionIndicator: false,
  timeline: true,
  animation: true,
  shadows: false,
  shouldAnimate: true,
  sceneMode: Cesium.SceneMode.SCENE3D,
});

// Improve visual quality
viewer.scene.fog.enabled = true;
viewer.scene.globe.enableLighting = true;
viewer.scene.highDynamicRange = false;
viewer.scene.postProcessStages.fxaa.enabled = true;

// ──────────────────────────────────────────
// Create Rocket Entity with flight path
// ──────────────────────────────────────────

// Launch site: Wenchang Space Launch Center (文昌航天发射场)
const launchLon = 110.951;
const launchLat = 19.614;
const launchAlt = 0;

// Flight simulation parameters
const launchTime = Cesium.JulianDate.fromDate(new Date(2025, 0, 1, 12, 0, 0));
const flightDuration = 180; // seconds of flight

/**
 * Build a rocket flight trajectory — vertical launch then gravity turn
 */
function buildFlightPath(speedMult = 3.0) {
  const positions = new Cesium.SampledPositionProperty();
  positions.setInterpolationOptions({
    interpolationDegree: 3,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  });

  const numPoints = 200;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const seconds = t * flightDuration;
    const time = Cesium.JulianDate.addSeconds(launchTime, seconds, new Cesium.JulianDate());

    // Phase 1: Vertical ascent (0-20s)
    // Phase 2: Gravity turn (20-60s)
    // Phase 3: Orbital insertion (60-180s)
    let lon, lat, alt;

    if (seconds < 20) {
      // Vertical climb
      const h = seconds / 20;
      lon = launchLon;
      lat = launchLat;
      alt = launchAlt + h * h * 8000 * speedMult; // accelerating
    } else if (seconds < 60) {
      // Gravity turn — start pitching east
      const h = (seconds - 20) / 40;
      lon = launchLon + h * h * 2.0 * speedMult;
      lat = launchLat + h * 0.15 * speedMult;
      alt = 8000 * speedMult + h * 60000 * speedMult;
    } else {
      // Orbital insertion — mostly horizontal
      const h = (seconds - 60) / 120;
      lon = launchLon + (0.5 * 2.0 + h * 6.0) * speedMult;
      lat = launchLat + (0.15 + h * 0.6) * speedMult;
      alt = (8000 + 60000) * speedMult + h * 150000 * speedMult;
    }

    positions.addSample(time, Cesium.Cartesian3.fromDegrees(lon, lat, alt));
  }

  return positions;
}

let rocketPosition = buildFlightPath(3.0);

// Rocket entity (simple point + path for now)
const rocketEntity = viewer.entities.add({
  name: '🚀 Rocket',
  position: rocketPosition,
  orientation: new Cesium.VelocityOrientationProperty(rocketPosition),
  point: {
    pixelSize: 8,
    color: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.fromCssColorString('#ff4400'),
    outlineWidth: 2,
  },
  path: {
    resolution: 1,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.15,
      color: Cesium.Color.fromCssColorString('#ff6622').withAlpha(0.6),
    }),
    width: 6,
    leadTime: 0,
    trailTime: 60,
  },
});

// ──────────────────────────────────────────
// Create Exhaust System
// ──────────────────────────────────────────
const exhaust = new RocketExhaust(viewer, {
  thrust: 1.0,
  plumeLength: 2.0,
  emissionRate: 300,
  smokeIntensity: 40,
  engineType: 'liquid',
});
exhaust.create(rocketEntity);

// ──────────────────────────────────────────
// Set initial clock & camera
// ──────────────────────────────────────────
viewer.clock.startTime = launchTime.clone();
viewer.clock.stopTime = Cesium.JulianDate.addSeconds(launchTime, flightDuration, new Cesium.JulianDate());
viewer.clock.currentTime = launchTime.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 0; // Start paused
viewer.clock.shouldAnimate = false;

viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);

// Set initial camera to see the launch pad
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(launchLon + 0.008, launchLat - 0.008, 300),
  orientation: {
    heading: Cesium.Math.toRadians(320),
    pitch: Cesium.Math.toRadians(-15),
    roll: 0,
  },
});

// ──────────────────────────────────────────
// Render loop — update exhaust every frame
// ──────────────────────────────────────────
viewer.scene.preRender.addEventListener((scene, time) => {
  exhaust.update(time);
});

// ──────────────────────────────────────────
// UI Controls
// ──────────────────────────────────────────

function setupSlider(id, callback) {
  const slider = document.getElementById(id);
  const valDisplay = document.getElementById(id + 'Val');
  if (!slider || !valDisplay) return;

  const update = () => {
    valDisplay.textContent = slider.value;
    callback(parseFloat(slider.value));
  };
  slider.addEventListener('input', update);
}

// Debounce system rebuild
let rebuildTimeout = null;
function scheduleRebuild(params) {
  clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(() => {
    exhaust.updateParams(params);
  }, 100);
}

setupSlider('thrust', (val) => {
  scheduleRebuild({ thrust: val });
});

setupSlider('plumeLength', (val) => {
  scheduleRebuild({ plumeLength: val });
});

setupSlider('emissionRate', (val) => {
  scheduleRebuild({ emissionRate: val });
});

setupSlider('smokeIntensity', (val) => {
  scheduleRebuild({ smokeIntensity: val });
});

setupSlider('rocketSpeed', (val) => {
  // Rebuild flight path with new speed
  rocketPosition = buildFlightPath(val);
  rocketEntity.position = rocketPosition;
  rocketEntity.orientation = new Cesium.VelocityOrientationProperty(rocketPosition);
  exhaust.entity = rocketEntity;
});

// Engine type selector
const engineTypeSelect = document.getElementById('engineType');
if (engineTypeSelect) {
  engineTypeSelect.addEventListener('change', () => {
    scheduleRebuild({ engineType: engineTypeSelect.value });
  });
}

// Flight toggle
let isFlying = false;
const toggleBtn = document.getElementById('toggleFlight');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    isFlying = !isFlying;
    if (isFlying) {
      viewer.clock.shouldAnimate = true;
      viewer.clock.multiplier = 1.0;
      toggleBtn.textContent = '⏸ 暂停飞行';

      // Track rocket from behind
      viewer.trackedEntity = rocketEntity;
    } else {
      viewer.clock.shouldAnimate = false;
      viewer.clock.multiplier = 0;
      toggleBtn.textContent = '▶ 开始飞行';
    }
  });
}

// Reset view
const resetBtn = document.getElementById('resetView');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    // Stop flight
    isFlying = false;
    viewer.clock.shouldAnimate = false;
    viewer.clock.multiplier = 0;
    viewer.clock.currentTime = launchTime.clone();
    if (toggleBtn) toggleBtn.textContent = '▶ 开始飞行';

    viewer.trackedEntity = undefined;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(launchLon + 0.008, launchLat - 0.008, 300),
      orientation: {
        heading: Cesium.Math.toRadians(320),
        pitch: Cesium.Math.toRadians(-15),
        roll: 0,
      },
      duration: 1.5,
    });
  });
}

console.log('🔥 CesiumFlame initialized — Rocket exhaust ready!');
