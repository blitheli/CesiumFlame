import { RocketExhaust } from './RocketExhaust.js';

// 1. 加载火箭模型
const launchPosition = Cesium.Cartesian3.fromDegrees(113.323, 22.987, 0); // 经度, 纬度, 海拔。请按实际需求修正
const rocketEntity = viewer.entities.add({
  name: "Astrox Launch Vehicle",
  position: launchPosition,
  model: {
    uri: 'http://www.astrox.cn:13542/resources/model/entityTypes/launchvehicle.glb',
    minimumPixelSize: 128,
    maximumScale: 400,
  }
});

// 2. 视角初始距离约200米
const directionVec = new Cesium.Cartesian3(0.0, -200.0, 50.0); // 相对 Y 轴偏移（朝北200m，高50m）
const cameraDestination = Cesium.Cartesian3.add(launchPosition, directionVec, new Cesium.Cartesian3());

viewer.scene.camera.setView({
  destination: cameraDestination,
  orientation: {
    heading: Cesium.Math.toRadians(0),   // 0度朝北，180度南，视项目需求调整
    pitch: Cesium.Math.toRadians(-15),
    roll: 0.0
  }
});

// 3. RocketExhaust 真实火焰羽流挂载
const exhaust = new RocketExhaust(viewer, {
  plumeLength: 14.0,          // 增大羽流长度，逼真
  thrust: 2.3,                // 更强推力感
  emissionRate: 700,          // 更多粒子
  smokeIntensity: 45,
  engineType: 'liquid'        // 可选 'liquid', 'solid', 'kerolox' 等
}).create(rocketEntity);

window._rocketExhaust = exhaust; // 便于后续调试