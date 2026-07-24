# IVES BESS-Planner Pro | 大型储能系统集装箱产线规划与容量测算系统

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg)](https://tailwindcss.com/)

**IVES BESS-Planner Pro** 是一款面向大型储能（BESS）集装箱集成制造工厂的专业工程规划与产能模拟仿真软件。软件专为工业工程（IE）、产线规划师与储能制造架构师设计，支持 5.016MWh / 6.25MWh 等主流集装箱规格的装配产线建模、Takt Time 节拍瓶颈分析、GWh 产能逆向测算、What-If 灵敏度仿真以及多版本工程对比。

---

## 🚀 核心功能亮点 (Key Features)

### 1. 📊 产线建模与瓶颈分析 (Line Modeling & Bottleneck Analysis)
* **全流程工序拆解**：涵盖电芯分选、模组堆叠、PACK组装、舱体预装、液冷与配电穿线、PACK上舱、高压耐压与-80kPa气密性检测、充放电EOL测试及Pack离线重工等全套储能装配工序。
* **精细化参数配置**：支持自定义各工序标准工时（Cycle Time）、设备并行台数（Parallel Lanes / Machines）、设备综合效率（OEE）、直通率（FPY）、重工工时及人员配置。
* **热力图与瓶颈识别**：实时生成工序 Takt Time 热力图，精确标记产线瓶颈工序（Bottleneck Station），计算产线平衡率（Line Balance Ratio）与平衡损失。

### 2. 🧮 GWh 产能逆向推导 (GWh Capacity Calculator)
* **目标产能倒推**：输入目标年产能（如 5GWh / 10GWh）及工作班制，自动倒推所需整线数量、线体瓶颈 Takt Time 需求。
* **推荐设备与 Capex 预算**：针对测试周期较长的关键工序（如充放电测试、气密性检测），自动推算推荐并行设备台数，并计算设备投资（Capex）及场地占用总面积（Footprint）。

### 3. 🎛️ What-If 灵敏度仿真 (What-If Sensitivity Simulator)
* **动态参数调节**：提供无级滑块与参数微调器，支持对线体 OEE 浮动、FPY 变化、班制调整（单班/双班/三班）进行实时仿真。
* **极速响应与差异对比**：实时计算仿真后的每日集装箱产出、年化 GWh 产能、瓶颈位移及产能目标达成率，极大地提升方案论证效率。

### 4. 🔀 多版本方案对比 (Multi-Version Comparison)
* **多维度平行对比**：支持创建与维护多个规划版本（如 5MWh 经典线、6.25MWh 高密线、全自动化升级线）。
* **关键指标 Dashboard**：一键横向对比不同版本的年产能（GWh）、产线平衡率（%）、设备总投资（万元）、整线定员及瓶颈工序，协助团队快速做出最优决策。

### 5. 📂 工程项目中心与离线持久化 (Project Manager & Local Storage)
* **IndexedDB 自动草稿恢复**：实时保存工程修改，防范意外关闭或网络中断导致的数据丢失。
* **JSON 工程导入与导出**：支持完整工程项目的 JSON 格式打包导出与一键恢复，方便团队间协作与方案归档。
* **快捷指令菜单 (Cmd+K)**：提供工业级全局快捷指令弹窗，快速切换视图、调整班制与导出报告。

### 6. 📑 仿真诊断报告与工艺规范 (Simulation Report & Quality Specs)
* **一键报告生成**：自动汇总当前工程的产线配置、KPI 评估、工序节拍明细及瓶颈优化建议。
* **制造工艺对标指南**：内置 5MWh 与 6.25MWh 储能舱对标规范、1-2-1 电芯分选及 -80kPa 气密性检测等 5M/1E 质量控制标准。

---

## 📐 核心工程计算公式 (Core Formulas)

1. **净有效运行时间 (Net Operating Time)**
   $$\text{Available Minutes Per Shift} = (\text{Hours Per Shift} \times 60) - \text{Planned Downtime (min)}$$
   $$\text{Annual Net Operating Time (min)} = \text{Available Minutes Per Shift} \times \text{Shifts/Day} \times \text{Operating Days/Year}$$

2. **工序真实有效节拍 (Effective Cycle Time)**
   $$\text{Base Cycle Time (min)} = \frac{\text{Standard Time (sec)} / 60}{\max(\text{Parallel Lanes}, \text{Machine Count})}$$
   $$\text{OEE Fraction} = \frac{\text{Availability} \times \text{Performance} \times \text{Quality}}{1000000}$$
   $$\text{Effective Cycle Time} = \frac{\text{Base Cycle Time}}{\text{OEE Fraction}} + \left( \frac{\text{Rework Rate}}{100} \times \frac{\text{Rework Time (sec)}}{60} \right)$$

3. **产线平衡率 (Line Balance Ratio)**
   $$\text{Line Balance Ratio (\%)} = \frac{\sum \text{Effective Cycle Time}}{\text{Number of Stations} \times \text{Bottleneck Cycle Time}} \times 100\%$$

4. **年化 GWh 产能 (Annual GWh Output)**
   $$\text{Daily Container Units} = \frac{\text{Daily Net Minutes}}{\text{Bottleneck Cycle Time (min)}}$$
   $$\text{Annual GWh} = \frac{\text{Daily Units} \times \text{Operating Days} \times \text{Container Spec (MWh)}}{1000}$$

---

## 🛠️ 技术栈 (Tech Stack)

* **前端框架**：[React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
* **构建工具**：[Vite 6](https://vitejs.dev/) + [esbuild](https://esbuild.github.io/)
* **样式与UI**：[Tailwind CSS v4](https://tailwindcss.com/) + [Motion](https://motion.dev/) (动画过渡) + [Lucide React](https://lucide.dev/) (图标库)
* **图表可视化**：[Recharts 3](https://recharts.org/)
* **后端服务**：[Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/)
* **数据持久化**：Browser IndexedDB (`idb` wrapper) + LocalStorage

---

## 📂 项目目录结构 (Directory Structure)

```text
ives-bess-planner/
├── .env.example             # 环境变量配置示例
├── metadata.json            # 应用元数据与权限定义
├── package.json             # 依赖与打包脚本
├── server.ts                # Express 后端入口与 Vite 中间件配置
├── index.html               # SPA HTML 入口
├── public/
│   ├── ives-logo.svg        # IVES 品牌 Logo 矢量图
│   └── favicon.ico
├── src/
│   ├── App.tsx              # 主应用组件与视图路由调度
│   ├── main.tsx             # React 渲染入口
│   ├── index.css            # 全局样式 (Tailwind 导入)
│   ├── components/          # 核心业务组件
│   │   ├── Navbar.tsx                   # 顶部导航栏 (主题切换、语言选择、报告生成)
│   │   ├── ProjectBar.tsx               # 工程状态栏 (工程选择、推送保存、草稿恢复)
│   │   ├── OverviewKpiCards.tsx         # 仪表盘核心 KPI 指卡组件
│   │   ├── LineModelingView.tsx         # 产线工序建模与参数配置视图
│   │   ├── GwhCapacityCalculator.tsx    # GWh 产能倒推计算器视图
│   │   ├── WhatIfSimulator.tsx          # What-If 灵敏度仿真视图
│   │   ├── MultiVersionCompare.tsx      # 多版本工程方案对比视图
│   │   ├── BottleneckChart.tsx          # 工序 Takt Time 瓶颈柱状图
│   │   ├── StationHeatmap.tsx           # 产线负荷与瓶颈热力图
│   │   ├── ProjectMenuModal.tsx         # 工程管理与弹窗组件
│   │   ├── SimulationReportModal.tsx    # 仿真诊断报告导出模态框
│   │   ├── CommandPaletteModal.tsx      # 工业级快捷指令面板 (Cmd+K)
│   │   └── BessProcessGuideModal.tsx    # BESS 工艺对标与质量控制规范
│   ├── context/
│   │   └── ProjectContext.tsx           # 工程状态管理与 IndexedDB 同步 Context
│   ├── types/
│   │   ├── bess.ts                      # BESS 工序、设备与产能参数类型定义
│   │   └── project.ts                   # 工程版本、历史记录与元数据类型定义
│   └── utils/
│       ├── capacityCalculator.ts        # 核心产能与节拍计算逻辑引擎
│       ├── defaultPresets.ts            # 5MWh 与 6.25MWh 预设工序与产线数据
│       ├── indexedDB.ts                 # IndexedDB 本地数据库存储封装
│       ├── i18n.ts                      # 中英文双语国际化词条
│       └── projectTemplates.ts          # 模版工程初始化定义
```

---

## 💻 本地开发与运行 (Getting Started)

### 前置要求 (Prerequisites)
* Node.js >= 18.0.0
* npm >= 9.0.0

### 1. 克隆项目与安装依赖
```bash
git clone https://github.com/your-org/ives-bess-planner.git
cd ives-bess-planner
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
服务默认在 `http://localhost:3000` 启动，集成 Express 与 Vite 开发热重载。

### 3. 代码检查 (Lint & Type Check)
```bash
npm run lint
```

### 4. 项目构建 (Build for Production)
```bash
npm run build
```
构建命令会使用 Vite 编译前端静态资源至 `dist/` 目录，并使用 esbuild 将 `server.ts` 打包为高效的 CommonJS 文件 `dist/server.cjs`。

### 5. 启动生产服务 (Start Production Server)
```bash
npm run start
```

---

## 📄 授权与许可 (License)

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
