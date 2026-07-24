/**
 * Pre-configured Industry Standard BESS Container Production Line Templates
 */

import { ProductionLineModel, ContainerSpec, StationParameter } from '../types/bess';

export const BESS_CONTAINER_SPECS: Record<string, ContainerSpec> = {
  S3440: {
    id: 'spec-3.44mwh',
    name: '3.44MWh 20尺风/液冷储能集装箱 (S3440)',
    energyCapacityMWh: 3.44,
    voltageLevelV: 1000,
    packCount: 288,
    clusterCount: 12,
    dimensions: '20尺标准 ISO 集装箱舱体'
  },
  L5000: {
    id: 'spec-5mwh',
    name: '5.01MWh 20尺高密液冷储能集装箱 (L5000)',
    energyCapacityMWh: 5.01,
    voltageLevelV: 1500,
    packCount: 384,
    clusterCount: 12,
    dimensions: '20尺高柜标准储能舱'
  },
  L6250: {
    id: 'spec-6.25mwh',
    name: '6.25MWh 20尺超高密液冷储能集装箱 (L6250)',
    energyCapacityMWh: 6.25,
    voltageLevelV: 1500,
    packCount: 480,
    clusterCount: 15,
    dimensions: '20尺高柜超高能量密度储能舱'
  }
};

// Generate 24 stations for Large Scale Giga-Factory
function generateGigaFactoryStations(): StationParameter[] {
  return [
    {
      id: 'stg-01',
      code: 'ST-01',
      name: 'AGV集装箱底盘检验与底板预装',
      category: 'PREP',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1200,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 99,
      performanceRate: 98,
      qualityRate: 99.5,
      reworkRate: 0.5,
      avgReworkTimeSec: 300,
      footprintSqM: 180,
      equipmentCostTenThousand: 420,
      description: 'AGV自动定位，集装箱结构检验与底板绝缘垫铺设。',
      keyQualityPoints: ['底盘接地电阻 < 0.1Ω', '激光对齐精度 ±0.5mm']
    },
    {
      id: 'stg-02',
      code: 'ST-02',
      name: '保温隔热与导轨结构支架组装',
      category: 'PREP',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1100,
      parallelLanes: 2,
      operatorsCount: 3,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 95,
      qualityRate: 99,
      reworkRate: 1,
      avgReworkTimeSec: 400,
      footprintSqM: 150,
      equipmentCostTenThousand: 280,
      description: '预埋液冷管道导轨与高强度支架安装。',
      keyQualityPoints: ['螺栓扭矩复核 45Nm']
    },
    {
      id: 'stg-03',
      code: 'ST-03',
      name: '电芯分选与模组堆叠分选阵列',
      category: 'PACK',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1000,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 97,
      performanceRate: 96,
      qualityRate: 99.8,
      reworkRate: 0.2,
      avgReworkTimeSec: 300,
      footprintSqM: 220,
      equipmentCostTenThousand: 850
    },
    {
      id: 'stg-04',
      code: 'ST-04',
      name: '双龙门激光巴排焊接工站 1',
      category: 'PACK',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1800,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 95,
      performanceRate: 92,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 600,
      footprintSqM: 260,
      equipmentCostTenThousand: 1100
    },
    {
      id: 'stg-05',
      code: 'ST-05',
      name: '激光巴排焊接工站 2 (冗余并线)',
      category: 'PACK',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1800,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 95,
      performanceRate: 92,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 600,
      footprintSqM: 260,
      equipmentCostTenThousand: 1100
    },
    {
      id: 'stg-06',
      code: 'ST-06',
      name: 'PACK外壳密封与灌胶绝缘检验',
      category: 'PACK',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1300,
      parallelLanes: 2,
      operatorsCount: 3,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 95,
      qualityRate: 99,
      reworkRate: 1,
      avgReworkTimeSec: 450,
      footprintSqM: 160,
      equipmentCostTenThousand: 320
    }
,
    {
      id: 'stg-07',
      code: 'ST-07',
      name: 'Multi-Axis Robotic PACK Rack Inserter A',
      category: 'CLUSTER',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1400,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 97,
      performanceRate: 96,
      qualityRate: 99.5,
      reworkRate: 0.5,
      avgReworkTimeSec: 400,
      footprintSqM: 240,
      equipmentCostTenThousand: 900
    },
    {
      id: 'stg-08',
      code: 'ST-08',
      name: 'Multi-Axis Robotic PACK Rack Inserter B',
      category: 'CLUSTER',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1400,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 97,
      performanceRate: 96,
      qualityRate: 99.5,
      reworkRate: 0.5,
      avgReworkTimeSec: 400,
      footprintSqM: 240,
      equipmentCostTenThousand: 900
    },
    {
      id: 'stg-09',
      code: 'ST-09',
      name: 'Servo Torque Tightening & Bolt Lock Check',
      category: 'CLUSTER',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1200,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 96,
      qualityRate: 99.8,
      reworkRate: 0.2,
      avgReworkTimeSec: 300,
      footprintSqM: 180,
      equipmentCostTenThousand: 520
    },
    {
      id: 'stg-10',
      code: 'ST-10',
      name: 'High Voltage Busbar & Combiner Box Wiring A',
      category: 'ELECTRICAL',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1250,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 99,
      performanceRate: 94,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 350,
      footprintSqM: 150,
      equipmentCostTenThousand: 240
    },
    {
      id: 'stg-11',
      code: 'ST-11',
      name: 'High Voltage Busbar & Combiner Box Wiring B',
      category: 'ELECTRICAL',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1250,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 99,
      performanceRate: 94,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 350,
      footprintSqM: 150,
      equipmentCostTenThousand: 240
    },
    {
      id: 'stg-12',
      code: 'ST-12',
      name: 'Level-1 & Level-2 BMS Signal Harness Trunking',
      category: 'ELECTRICAL',
      automationLevel: 'MANUAL',
      standardTimeSec: 1100,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 99.5,
      performanceRate: 92,
      qualityRate: 98,
      reworkRate: 2,
      avgReworkTimeSec: 300,
      footprintSqM: 120,
      equipmentCostTenThousand: 110
    },
    {
      id: 'stg-13',
      code: 'ST-13',
      name: 'Liquid Cooling Chiller Pipeline Coupling',
      category: 'AUXILIARY',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1150,
      parallelLanes: 2,
      operatorsCount: 3,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 95,
      qualityRate: 99,
      reworkRate: 1,
      avgReworkTimeSec: 400,
      footprintSqM: 140,
      equipmentCostTenThousand: 310
    },
    {
      id: 'stg-14',
      code: 'ST-14',
      name: 'Coolant Pressure Holding & Helium Leak Testing',
      category: 'AUXILIARY',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 1200,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 96,
      performanceRate: 95,
      qualityRate: 99.5,
      reworkRate: 0.5,
      avgReworkTimeSec: 600,
      footprintSqM: 180,
      equipmentCostTenThousand: 680
    },
    {
      id: 'stg-15',
      code: 'ST-15',
      name: 'Fire Alarm & Aerosol Gas Sensor Integration',
      category: 'AUXILIARY',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1050,
      parallelLanes: 2,
      operatorsCount: 3,
      machinesCount: 2,
      availabilityRate: 99,
      performanceRate: 96,
      qualityRate: 99.5,
      reworkRate: 0.5,
      avgReworkTimeSec: 300,
      footprintSqM: 130,
      equipmentCostTenThousand: 260
    },
    {
      id: 'stg-16',
      code: 'ST-16',
      name: 'PCS Inverter Cabin Alignment & Busbar Coupling A',
      category: 'PCS',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1400,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 96,
      performanceRate: 93,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 500,
      footprintSqM: 200,
      equipmentCostTenThousand: 580
    },
    {
      id: 'stg-17',
      code: 'ST-17',
      name: 'PCS Inverter Cabin Alignment & Busbar Coupling B',
      category: 'PCS',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1400,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 96,
      performanceRate: 93,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 500,
      footprintSqM: 200,
      equipmentCostTenThousand: 580
    },
    {
      id: 'stg-18',
      code: 'ST-18',
      name: 'Insulation & Hi-Pot Insulation Resistance Station 1',
      category: 'TEST',
      automationLevel: 'TEST_BENCH',
      standardTimeSec: 1300,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 96,
      qualityRate: 98,
      reworkRate: 2,
      avgReworkTimeSec: 600,
      footprintSqM: 160,
      equipmentCostTenThousand: 650
    },
    {
      id: 'stg-19',
      code: 'ST-19',
      name: 'BMS L1-L3 Communication & Voltage Delta Validation',
      category: 'TEST',
      automationLevel: 'TEST_BENCH',
      standardTimeSec: 1200,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 97,
      qualityRate: 98.5,
      reworkRate: 1.5,
      avgReworkTimeSec: 500,
      footprintSqM: 150,
      equipmentCostTenThousand: 540
    },
    {
      id: 'stg-20',
      code: 'ST-20',
      name: 'Full Load PCS Charge/Discharge Test Bay 1 & 2',
      category: 'TEST',
      automationLevel: 'TEST_BENCH',
      standardTimeSec: 3200,
      parallelLanes: 4,
      operatorsCount: 3,
      machinesCount: 4,
      availabilityRate: 95,
      performanceRate: 92,
      qualityRate: 98,
      reworkRate: 2,
      avgReworkTimeSec: 1200,
      footprintSqM: 350,
      equipmentCostTenThousand: 1800
    },
    {
      id: 'stg-21',
      code: 'ST-21',
      name: 'Full Load PCS Charge/Discharge Test Bay 3 & 4',
      category: 'TEST',
      automationLevel: 'TEST_BENCH',
      standardTimeSec: 3200,
      parallelLanes: 4,
      operatorsCount: 3,
      machinesCount: 4,
      availabilityRate: 95,
      performanceRate: 92,
      qualityRate: 98,
      reworkRate: 2,
      avgReworkTimeSec: 1200,
      footprintSqM: 350,
      equipmentCostTenThousand: 1800
    },
    {
      id: 'stg-22',
      code: 'ST-22',
      name: 'Thermal Imaging Inspection & Emergency Shut-Off Test',
      category: 'TEST',
      automationLevel: 'TEST_BENCH',
      standardTimeSec: 1100,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 99,
      performanceRate: 96,
      qualityRate: 99,
      reworkRate: 1,
      avgReworkTimeSec: 400,
      footprintSqM: 160,
      equipmentCostTenThousand: 480
    },
    {
      id: 'stg-23',
      code: 'ST-23',
      name: 'Laser Marking, Nameplates & Protective Terminal Caps',
      category: 'PACKAGING',
      automationLevel: 'FULL_AUTO',
      standardTimeSec: 900,
      parallelLanes: 2,
      operatorsCount: 2,
      machinesCount: 2,
      availabilityRate: 99.5,
      performanceRate: 98,
      qualityRate: 100,
      reworkRate: 0,
      avgReworkTimeSec: 0,
      footprintSqM: 180,
      equipmentCostTenThousand: 320
    },
    {
      id: 'stg-24',
      code: 'ST-24',
      name: 'Heavy Overhead Crane Lifting & Moisture Wrapping',
      category: 'PACKAGING',
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: 1200,
      parallelLanes: 2,
      operatorsCount: 4,
      machinesCount: 2,
      availabilityRate: 98,
      performanceRate: 96,
      qualityRate: 100,
      reworkRate: 0,
      avgReworkTimeSec: 0,
      footprintSqM: 280,
      equipmentCostTenThousand: 450
    }
  ];
}

export const DEFAULT_LINE_MODELS: ProductionLineModel[] = [
  // 1. 5GWh Lean Line
  {
    id: 'preset-5gwh-lean',
    name: '5GWh 储能精益自动化产线 (5GWh 精益)',
    version: 'V2.0-5GWh精益',
    updatedAt: new Date().toISOString(),
    description: '5GWh 年产能精益高效储能产线。采用 5.01MWh 20尺高柜液冷舱，3班300天生产，目标年产 1,000 台集装箱，全线需求节拍 30 分钟/台，支持柔性换型与双并线关键检测。',
    containerSpec: BESS_CONTAINER_SPECS.L5000,
    shiftConfig: {
      shiftsPerDay: 3,
      hoursPerShift: 8,
      plannedDowntimeMinPerShift: 30,
      operatingDaysPerYear: 300
    },
    targetAnnualGWh: 5.0,
    targetTaktTimeMin: 30.0,
    stations: generateGigaFactoryStations().slice(0, 16).map((s, idx) => {
      const baseMin = s.standardTimeSec / 60;
      const neededLanes = Math.max(1, Math.ceil(baseMin / 30.0));
      return {
        ...s,
        id: `st5g-${idx + 1}`,
        code: `ST-${(idx + 1).toString().padStart(2, '0')}`,
        parallelLanes: neededLanes,
        machinesCount: neededLanes
      };
    })
  },

  // 2. 10GWh Intelligent Line
  {
    id: 'preset-10gwh-intelligent',
    name: '10GWh 储能智能化 Gigafactory 产线 (10GWh 智能)',
    version: 'V3.0-10GWh智能',
    updatedAt: new Date().toISOString(),
    description: '10GWh 年产能 GigaFactory 智能化标准产线。采用 5.01MWh 液冷储能舱，3班330天高效生产，目标年产 2,000 台，全线需求节拍 22.5 分钟/台，配备全流程 AGV 与 24 工站智能矩阵。',
    containerSpec: BESS_CONTAINER_SPECS.L5000,
    shiftConfig: {
      shiftsPerDay: 3,
      hoursPerShift: 8,
      plannedDowntimeMinPerShift: 20,
      operatingDaysPerYear: 330
    },
    targetAnnualGWh: 10.0,
    targetTaktTimeMin: 22.5,
    stations: generateGigaFactoryStations().map((s, idx) => {
      const baseMin = s.standardTimeSec / 60;
      const neededLanes = Math.max(1, Math.ceil(baseMin / 22.5));
      return {
        ...s,
        id: `st10g-${idx + 1}`,
        code: `ST-${(idx + 1).toString().padStart(2, '0')}`,
        parallelLanes: neededLanes,
        machinesCount: neededLanes
      };
    })
  },

  // 3. 15GWh Benchmark Line
  {
    id: 'preset-15gwh-giga',
    name: '15GWh 储能 Gigafactory 极速精益产线 (15GWh 标杆)',
    version: 'V4.5-15GWh标杆',
    updatedAt: new Date().toISOString(),
    description: '15GWh 年产能行业标杆产线方案。采用 5.01MWh 20尺高柜液冷舱规格，3班330天高效运营，年需产出 3,000 台储能集装箱。全线目标节拍 18.0 分钟/台，配有高效率柔性工站与多通道充放电并线检测。',
    containerSpec: BESS_CONTAINER_SPECS.L5000,
    shiftConfig: {
      shiftsPerDay: 3,
      hoursPerShift: 8,
      plannedDowntimeMinPerShift: 20,
      operatingDaysPerYear: 330
    },
    targetAnnualGWh: 15.0,
    targetTaktTimeMin: 18.0,
    stations: generateGigaFactoryStations().map((s, idx) => {
      const baseMin = s.standardTimeSec / 60;
      const neededLanes = Math.max(1, Math.ceil(baseMin / 18.0));
      return {
        ...s,
        id: `st15g-${idx + 1}`,
        code: `ST-${(idx + 1).toString().padStart(2, '0')}`,
        parallelLanes: neededLanes,
        machinesCount: neededLanes
      };
    })
  },

  // 4. 20GWh Super-Gigafactory Line
  {
    id: 'preset-20gwh-super-giga',
    name: '20GWh 储能超级工厂 (Super-Gigafactory) 极速智能化产线 (20GWh 超级工厂)',
    version: 'V5.0-20GWh旗舰',
    updatedAt: new Date().toISOString(),
    description: '20GWh 年产能大型储能超级工厂旗舰配置。采用 5.01MWh 20尺高柜液冷舱规格，配置 24 全流程智能化工站与高并发平行矩阵测试，具备全自动 AGV 物流与高压连线，支持年产 4,000 台储能集装箱。全线目标节拍 13.5 分钟/台。',
    containerSpec: BESS_CONTAINER_SPECS.L5000,
    shiftConfig: {
      shiftsPerDay: 3,
      hoursPerShift: 8,
      plannedDowntimeMinPerShift: 20,
      operatingDaysPerYear: 330
    },
    targetAnnualGWh: 20.0,
    targetTaktTimeMin: 13.5,
    stations: generateGigaFactoryStations().map((s, idx) => {
      const baseMin = s.standardTimeSec / 60;
      const neededLanes = Math.max(1, Math.ceil(baseMin / 13.5));
      return {
        ...s,
        id: `st20g-${idx + 1}`,
        code: `ST-${(idx + 1).toString().padStart(2, '0')}`,
        parallelLanes: neededLanes,
        machinesCount: neededLanes
      };
    })
  }
];

