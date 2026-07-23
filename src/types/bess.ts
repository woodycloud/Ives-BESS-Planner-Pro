/**
 * BESS Container Production Line Capacity Planning Types
 */

export type ProcessCategory = 
  | 'PREP'         // Container Preparation & Shell Assembly
  | 'PACK'         // Battery Pack & Module Laser Welding
  | 'CLUSTER'      // Battery Cluster Rack Insertion & Torque Tightening
  | 'ELECTRICAL'   // Power Cables, HV Box & Combiner Wiring
  | 'AUXILIARY'    // Liquid Cooling Chiller & Fire Suppression Integration
  | 'PCS'          // PCS Inverter & Transformer Cabin Integration
  | 'TEST'         // Insulation, Voltage Withstand & BMS Test
  | 'PACKAGING';   // Nameplate, Quality Assurance & Shipping Packaging

export type AutomationLevel = 'MANUAL' | 'SEMI_AUTO' | 'FULL_AUTO' | 'TEST_BENCH';

export interface StationParameter {
  id: string;
  code: string;                  // e.g. "ST-01"
  name: string;                  // e.g. "PACK Cluster Assembly & Tightening"
  category: ProcessCategory;
  automationLevel: AutomationLevel;
  
  // Standard operating parameter
  standardTimeSec: number;       // Standard cycle time per unit (seconds)
  parallelLanes: number;         // Number of parallel process lanes (default = 1)
  
  // Staff & Equipment
  operatorsCount: number;        // Operators count per shift
  machinesCount: number;         // Machines / test stations count
  
  // OEE Components
  availabilityRate: number;      // 0 - 100 (%) Equipment Availability
  performanceRate: number;       // 0 - 100 (%) Speed / Performance Rate
  qualityRate: number;           // 0 - 100 (%) First Pass Yield (FPY)
  
  // Rework & Quality
  reworkRate: number;            // 0 - 100 (%) Rework Probability Rate
  avgReworkTimeSec: number;      // Average rework time penalty (seconds)
  
  // Physical & Financial
  footprintSqM: number;          // Floor footprint (m²)
  equipmentCostTenThousand: number; // Equipment Capex (10,000 RMB / ~$1,400 USD)
  
  // Description / Key Process
  description?: string;
  keyQualityPoints?: string[];   // Key quality control checkpoints (e.g. Insulation > 2GΩ)
}

export interface ShiftConfig {
  shiftsPerDay: 1 | 2 | 3;
  hoursPerShift: number;         // e.g. 8h or 10h
  plannedDowntimeMinPerShift: number; // Planned breaks, shift change, briefing downtime (mins)
  operatingDaysPerYear: number;  // Operating days per year (e.g. 250 / 300 / 330)
}

export interface ContainerSpec {
  id: string;
  name: string;                  // e.g. "5.0MWh 20ft Liquid-Cooled BESS Container"
  energyCapacityMWh: number;     // e.g. 5.0 MWh
  voltageLevelV: number;         // e.g. 1500 V
  packCount: number;             // Battery PACK count per container (e.g. 384)
  clusterCount: number;          // Battery Cluster count (e.g. 12)
  dimensions?: string;           // e.g. "20ft HC Standard Container"
}

export interface ProductionLineModel {
  id: string;
  name: string;
  version: string;
  updatedAt: string;
  description: string;
  containerSpec: ContainerSpec;
  shiftConfig: ShiftConfig;
  targetAnnualGWh: number;       // Target annual capacity (GWh)
  stations: StationParameter[];
  targetTaktTimeMin?: number;    // Target demand Takt Time (mins/unit)
}

export interface CalculatedStationMetrics {
  stationId: string;
  code: string;
  name: string;
  category: ProcessCategory;
  effectiveCycleTimeMin: number; // Effective total cycle time per unit (mins)
  effectiveOEEPercent: number;    // Effective Station OEE (%)
  utilizationRatePercent: number;// Workstation utilization / load rate (%)
  isBottleneck: boolean;         // Is this station the line bottleneck
  operatorsTotal: number;
  equipmentCost: number;
  footprint: number;
  passRate: number;
}

export interface CapacityCalculationResult {
  lineModelId: string;
  calculatedAt: string;
  
  // Takt Time
  availableMinutesPerDay: number;
  availableMinutesPerYear: number;
  lineTaktTimeMin: number;       // Actual line bottleneck Takt Time (min/unit)
  demandTaktTimeMin: number;     // Target demand Takt Time (min/unit)
  
  // Output Capacity
  dailyUnitsOutput: number;      // Daily BESS container units output
  dailyMWhOutput: number;        // Daily MWh output
  annualUnitsOutput: number;     // Annual BESS container units output
  annualGWhOutput: number;       // Annual GWh output
  
  // Target vs Actual Gap
  capacityTargetMetPercent: number; // Capacity target achievement rate (%)
  
  // Line Balance & Efficiency
  lineBalanceRatioPercent: number; // Line balance ratio (%)
  balanceLossPercent: number;      // Balance loss ratio (%)
  bottleneckStationCode: string;
  bottleneckStationName: string;
  bottleneckCycleTimeMin: number;
  lineFPYPercent: number;          // Overall line First Pass Yield (%)
  averageOEEPercent: number;       // Average line OEE (%)
  
  // Resource Aggregates
  totalOperators: number;
  totalEquipmentCost: number;      // Total capex (10,000 RMB)
  totalFootprintSqM: number;
  investmentPerGWh: number;        // Capex density (10,000 RMB / GWh)
  
  // Detailed station outputs
  stationMetrics: CalculatedStationMetrics[];
}

export interface WhatIfScenarioConfig {
  id: string;
  name: string;
  shiftConfig: ShiftConfig;
  targetAnnualGWh: number;
  operatorMultiplier: number;      // Staff ratio modifier
  parallelLaneOverrides: Record<string, number>; // stationId -> lanes
  cycleTimeAdjustmentsSec: Record<string, number>; // stationId -> +/- sec
  oeeAdjustmentsPercent: Record<string, number>; // stationId -> +/- %
}

export interface PlanVersionSnapshot {
  id: string;
  versionName: string;
  createdAt: string;
  notes: string;
  lineModel: ProductionLineModel;
  result: CapacityCalculationResult;
}

export interface SimulationReportData {
  reportId: string;
  generatedAt: string;
  plannerName: string;
  projectName: string;
  baselineVersionName: string;
  calculatedResult: CapacityCalculationResult;
  lineModel: ProductionLineModel;
  whatIfApplied?: boolean;
  scenarioNotes?: string;
  riskDiagnosis: string[];
  recommendations: string[];
}
