import { ProjectTemplate } from '../types/project';
import { DEFAULT_LINE_MODELS, BESS_CONTAINER_SPECS } from './defaultPresets';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tmpl-5mwh-standard',
    name: '5.01MWh 20ft Standard BESS Container Line',
    nameZh: '5.01MWh 20尺高柜标准储能集装箱产线工程',
    category: 'Standard',
    description: 'Industry standard 5.01MWh liquid-cooled container production line layout with 16 stations, 15PPM cell binning, and 1500V HV testing.',
    descriptionZh: '行业主流 5.01MWh 20尺高柜液冷储能舱整线规划模板。包含16个精益工站、电芯1-2-1配组、激光巴排焊接、-80kPa气密检测与1500V高压测试。',
    model: DEFAULT_LINE_MODELS[0],
    tags: ['5.01MWh', '314Ah', '20ft HC', '15PPM'],
    containerCapacityMWh: 5.01
  },
  {
    id: 'tmpl-6.25mwh-high-density',
    name: '6.25MWh High Density 20ft BESS Line',
    nameZh: '6.25MWh 超高密 20尺液冷储能舱产线工程',
    category: 'HighDensity',
    description: 'Next-gen 6.25MWh high energy density container line with 480 PACKs (15 clusters), robotic insertion, and extended FAT charge/discharge bays.',
    descriptionZh: '二代 6.25MWh 超高密度储能集装箱产线工程模板。容纳480个PACK (15簇)，配置重载自动装箱机器人、多通道液冷保压与延长FAT平衡调试工时。',
    model: {
      ...DEFAULT_LINE_MODELS[0],
      id: 'model-6.25mwh-hd',
      name: '6.25MWh 超高密储能舱工程产线 (L6250)',
      version: 'V2.5-6.25MWh超高密',
      containerSpec: BESS_CONTAINER_SPECS.L6250,
      targetAnnualGWh: 6.25,
      targetTaktTimeMin: 28.0,
      description: '6.25MWh 超高能量密度储能舱产线方案，针对电芯数量多出25%进行加工节拍与气密测试优化。'
    },
    tags: ['6.25MWh', 'High-Density', 'CTP', 'FAT-Balancing'],
    containerCapacityMWh: 6.25
  },
  {
    id: 'tmpl-10gwh-gigafactory',
    name: '10GWh Intelligent BESS Gigafactory',
    nameZh: '10GWh 智能化储能超级工厂 (Gigafactory) 产线',
    category: 'Flexible',
    description: '24-station fully automated GigaFactory layout featuring dual-gantry laser welding, AGV logistics, and 4-bay charge/discharge testing.',
    descriptionZh: '24工站全流程智能化 GigaFactory 标杆产线模板。配置双龙门激光巴排焊接、AGV矩阵调度、4通道交直流充放电测试与全生命周期 MES 数据链。',
    model: DEFAULT_LINE_MODELS[1],
    tags: ['10GWh', 'Gigafactory', 'AGV', '24 Stations'],
    containerCapacityMWh: 5.01
  },
  {
    id: 'tmpl-custom-blank',
    name: 'Custom Blank BESS Line Architecture',
    nameZh: '自定义空白储能产线工程',
    category: 'Custom',
    description: 'Blank project canvas with baseline station structure ready for customized cell parameters, takt time calculations, and capex budgeting.',
    descriptionZh: '空白工程项目基线。适合根据特定客户需求自顶向下构建特种储能舱（如3.44MWh或方舱）装配工站参数与投资预算。',
    model: {
      ...DEFAULT_LINE_MODELS[0],
      id: `model-custom-${Date.now()}`,
      name: '自定义储能产线规划工程',
      version: 'V1.0-Custom',
      description: '自定义储能产线规划方案。'
    },
    tags: ['Custom', 'Flex-Line', 'User-Defined'],
    containerCapacityMWh: 5.01
  }
];
