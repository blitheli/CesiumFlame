/**
 * Engine type presets — realistic color profiles for different propellants
 */
export const ENGINE_PRESETS = {
  /**
   * LOX/RP-1 (Kerosene) — e.g. Falcon 9 Merlin, Saturn V F-1
   * Bright orange-yellow flame, heavy soot/smoke, prominent shock diamonds
   */
  liquid: {
    name: 'LOX/RP-1 液体发动机',
    core: {
      startColor: [1.0, 1.0, 0.95, 1.0],
      endColor: [1.0, 0.85, 0.3, 0.0],
    },
    flame: {
      startColor: [1.0, 0.65, 0.12, 0.85],
      endColor: [1.0, 0.25, 0.02, 0.0],
    },
    outerGlow: {
      startColor: [1.0, 0.5, 0.08, 0.35],
      endColor: [0.9, 0.15, 0.0, 0.0],
    },
    smoke: {
      startColor: [0.55, 0.5, 0.45, 0.5],
      endColor: [0.7, 0.65, 0.6, 0.0],
    },
    shockDiamonds: true,
    shockDiamondCount: 5,
    smokeIntensityMult: 1.5,
  },

  /**
   * Solid Rocket Booster (SRB) — e.g. Space Shuttle SRB, Ariane 5 EAP
   * Dense white/gray smoke, bright yellow flame, very thick plume
   */
  solid: {
    name: '固体发动机 (SRB)',
    core: {
      startColor: [1.0, 1.0, 0.85, 1.0],
      endColor: [1.0, 0.9, 0.4, 0.0],
    },
    flame: {
      startColor: [1.0, 0.75, 0.2, 0.9],
      endColor: [1.0, 0.4, 0.05, 0.0],
    },
    outerGlow: {
      startColor: [1.0, 0.6, 0.15, 0.4],
      endColor: [0.8, 0.3, 0.05, 0.0],
    },
    smoke: {
      startColor: [0.85, 0.82, 0.78, 0.75],
      endColor: [0.95, 0.92, 0.88, 0.0],
    },
    shockDiamonds: false,
    shockDiamondCount: 0,
    smokeIntensityMult: 3.0,
  },

  /**
   * LOX/LH2 (Hydrogen) — e.g. RS-25 (SSME), RL-10, Vulcain
   * Nearly invisible flame (pale blue), very little smoke, clean exhaust
   */
  hydrolox: {
    name: '氢氧发动机 (LOX/LH2)',
    core: {
      startColor: [0.8, 0.85, 1.0, 1.0],
      endColor: [0.6, 0.7, 1.0, 0.0],
    },
    flame: {
      startColor: [0.7, 0.75, 1.0, 0.5],
      endColor: [0.5, 0.55, 0.9, 0.0],
    },
    outerGlow: {
      startColor: [0.6, 0.65, 1.0, 0.2],
      endColor: [0.4, 0.45, 0.8, 0.0],
    },
    smoke: {
      startColor: [0.9, 0.92, 0.95, 0.15],
      endColor: [0.95, 0.97, 1.0, 0.0],
    },
    shockDiamonds: true,
    shockDiamondCount: 7,
    smokeIntensityMult: 0.3,
  },

  /**
   * LOX/CH4 (Methane) — e.g. SpaceX Raptor, BE-4
   * Blue-ish flame with some orange, moderate smoke, clean-ish burn
   */
  methalox: {
    name: '甲烷发动机 (LOX/CH4)',
    core: {
      startColor: [0.85, 0.9, 1.0, 1.0],
      endColor: [0.7, 0.8, 1.0, 0.0],
    },
    flame: {
      startColor: [0.6, 0.7, 1.0, 0.75],
      endColor: [1.0, 0.5, 0.15, 0.0],
    },
    outerGlow: {
      startColor: [0.65, 0.6, 0.95, 0.3],
      endColor: [0.9, 0.35, 0.08, 0.0],
    },
    smoke: {
      startColor: [0.65, 0.68, 0.72, 0.3],
      endColor: [0.8, 0.82, 0.85, 0.0],
    },
    shockDiamonds: true,
    shockDiamondCount: 6,
    smokeIntensityMult: 0.6,
  },
};
