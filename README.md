# 🔥 CesiumFlame

**真实感火箭发动机尾焰效果** — 基于 Vite + CesiumJS 粒子系统

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![Cesium](https://img.shields.io/badge/CesiumJS-1.125-6caddf?logo=cesium)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性

- 🔥 **5层粒子系统架构** — 热核心、激波菱形、火焰体、外辉光、烟雾尾迹
- 🎨 **4种发动机类型** — LOX/RP-1 液体、固体 SRB、氢氧 LOX/LH2、甲烷 LOX/CH4
- 🎛️ **实时参数控制** — 推力、尾焰长度、排放速率、烟雾浓度、飞行速度
- 🚀 **飞行轨迹模拟** — 垂直上升→重力转弯→入轨段
- 📦 **零外部贴图** — 所有粒子纹理由 Canvas 程序化生成
- ⚡ **基于 Vite** — 极速开发体验

## 🏗️ 技术架构

```
5层粒子系统 (Particle Layers)
├── Layer 1: Hot Core          白热喷口核心 — 窄锥角，高亮度
├── Layer 2: Shock Diamonds    激波菱形 — 马赫盘脉动效果
├── Layer 3: Flame Body        火焰主体 — 橙黄色燃烧羽流
├── Layer 4: Outer Glow        外部辉光 — 宽幅热辐射光晕
└── Layer 5: Smoke Trail       烟雾尾迹 — 膨胀、重力下沉、风漂移
```

### 发动机类型颜色特征

| 类型 | 真实发动机 | 火焰颜色 | 烟雾 | 激波菱形 |
|------|-----------|---------|------|---------|
| **LOX/RP-1** | Falcon 9 Merlin, Saturn V F-1 | 橙黄色 | 浓密灰烟 | ✅ 5个 |
| **SRB 固体** | STS SRB, Ariane 5 EAP | 亮黄色 | 极浓白烟 | ❌ |
| **LOX/LH2** | RS-25 (SSME), RL-10 | 淡蓝色（近透明） | 极少 | ✅ 7个 |
| **LOX/CH4** | SpaceX Raptor, BE-4 | 蓝紫→橙色 | 少量 | ✅ 6个 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/blitheli/CesiumFlame.git
cd CesiumFlame

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 项目结构

```
CesiumFlame/
├── index.html              # 主页面 + 控制面板 UI
├── vite.config.js          # Vite + Cesium 插件配置
├── package.json
└── src/
    ├── main.js             # 入口：Viewer、火箭实体、飞行轨迹、UI
    ├── RocketExhaust.js    # 核心：5层粒子系统管理器
    ├── textures.js         # 程序化粒子纹理生成 (Canvas)
    └── enginePresets.js    # 4种发动机类型颜色预设
```

## 🎛️ 参数说明

| 参数 | 范围 | 说明 |
|------|------|------|
| 发动机推力 | 0.1 - 3.0 | 控制粒子速度、尺寸、排放量 |
| 尾焰长度 | 0.5 - 5.0 | 控制粒子生命周期（越长越远） |
| 排放速率 | 50 - 800 | 每秒粒子数量 |
| 烟雾浓度 | 0 - 100 | 烟雾层不透明度 |
| 飞行速度 | 0.5 - 10.0 | 火箭飞行轨迹缩放倍数 |

## 🔧 自定义 Cesium Ion Token

编辑 `src/main.js` 中的 Token：

```javascript
Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_TOKEN';
```

免费获取: https://ion.cesium.com/tokens

## License

MIT
