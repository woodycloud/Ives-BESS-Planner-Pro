/**
 * BESS Container Capacity & Line Balancing Calculation Engine
 */

import { ProductionLineModel, CapacityCalculationResult, CalculatedStationMetrics } from '../types/bess';

export function calculateLineCapacity(model: ProductionLineModel): CapacityCalculationResult {
  const { shiftConfig, containerSpec, targetAnnualGWh, stations } = model;
  
  // 1. Calculate Daily & Annual Net Operating Minutes
  const netShiftMinutes = Math.max(10, (shiftConfig.hoursPerShift * 60) - shiftConfig.plannedDowntimeMinPerShift);
  const availableMinutesPerDay = netShiftMinutes * shiftConfig.shiftsPerDay;
  const availableMinutesPerYear = availableMinutesPerDay * shiftConfig.operatingDaysPerYear;

  // 2. Compute Individual Station Effective Cycle Times
  let maxCycleTimeMin = 0;
  let totalCycleTimeMin = 0;
  let bottleneckStationId = '';
  let totalOperators = 0;
  let totalEquipmentCost = 0;
  let totalFootprintSqM = 0;
  let lineFPYProduct = 1.0;
  let sumOEE = 0;

  const stationMetricsMap: Map<string, CalculatedStationMetrics> = new Map();

  stations.forEach((st) => {
    // Parallel channels factor
    const parallelLanes = Math.max(1, st.parallelLanes || 1);
    const machinesCount = Math.max(1, st.machinesCount || 1);
    
    // Standard time per lane in minutes
    const stdTimeMin = (st.standardTimeSec || 60) / 60;
    const baseTimeMin = stdTimeMin / (parallelLanes * machinesCount);

    // OEE breakdown
    const avail = (st.availabilityRate || 100) / 100;
    const perf = (st.performanceRate || 100) / 100;
    const qual = (st.qualityRate || 100) / 100;
    const oeeFrac = Math.max(0.01, avail * perf * qual);
    
    // Rework impact
    const reworkMin = ((st.reworkRate || 0) / 100) * ((st.avgReworkTimeSec || 0) / 60);

    // Effective Cycle Time in minutes
    const effectiveCycleTimeMin = (baseTimeMin / oeeFrac) + reworkMin;

    if (effectiveCycleTimeMin > maxCycleTimeMin) {
      maxCycleTimeMin = effectiveCycleTimeMin;
      bottleneckStationId = st.id;
    }

    totalCycleTimeMin += effectiveCycleTimeMin;
    totalOperators += st.operatorsCount * shiftConfig.shiftsPerDay;
    totalEquipmentCost += st.equipmentCostTenThousand || 0;
    totalFootprintSqM += st.footprintSqM || 0;
    lineFPYProduct *= Math.max(0.01, qual);
    sumOEE += oeeFrac * 100;

    stationMetricsMap.set(st.id, {
      stationId: st.id,
      code: st.code,
      name: st.name,
      category: st.category,
      effectiveCycleTimeMin,
      effectiveOEEPercent: Math.round(oeeFrac * 1000) / 10,
      utilizationRatePercent: 0, // calculated next
      isBottleneck: false,
      operatorsTotal: st.operatorsCount * shiftConfig.shiftsPerDay,
      equipmentCost: st.equipmentCostTenThousand || 0,
      footprint: st.footprintSqM || 0,
      passRate: Math.round(qual * 1000) / 10
    });
  });

  const lineTaktTimeMin = Math.max(0.01, maxCycleTimeMin);

  // 3. Mark Bottleneck & Calculate Station Utilization Rates
  const stationMetrics: CalculatedStationMetrics[] = stations.map((st) => {
    const metrics = stationMetricsMap.get(st.id)!;
    const utilizationRatePercent = Math.min(100, Math.round((metrics.effectiveCycleTimeMin / lineTaktTimeMin) * 1000) / 10);
    const isBottleneck = st.id === bottleneckStationId;

    return {
      ...metrics,
      utilizationRatePercent,
      isBottleneck
    };
  });

  const bottleneckSt = stations.find(s => s.id === bottleneckStationId);

  // 4. Calculate Customer Demand Takt Time
  const targetAnnualUnits = (targetAnnualGWh * 1000) / Math.max(0.1, containerSpec.energyCapacityMWh);
  const targetDailyUnits = targetAnnualUnits / Math.max(1, shiftConfig.operatingDaysPerYear);
  const demandTaktTimeMin = Math.round((availableMinutesPerDay / Math.max(0.001, targetDailyUnits)) * 100) / 100;

  // 5. Output Capacity Calculations
  const dailyUnitsOutput = Math.round((availableMinutesPerDay / lineTaktTimeMin) * 100) / 100;
  const dailyMWhOutput = Math.round((dailyUnitsOutput * containerSpec.energyCapacityMWh) * 10) / 10;
  
  const annualUnitsOutput = Math.round(dailyUnitsOutput * shiftConfig.operatingDaysPerYear);
  const annualGWhOutput = Math.round(((annualUnitsOutput * containerSpec.energyCapacityMWh) / 1000) * 1000) / 1000;

  const capacityTargetMetPercent = Math.round((annualGWhOutput / Math.max(0.001, targetAnnualGWh)) * 1000) / 10;

  // 6. Line Balance Ratio
  const numStations = Math.max(1, stations.length);
  const lineBalanceRatioPercent = Math.round((totalCycleTimeMin / (numStations * lineTaktTimeMin)) * 1000) / 10;
  const balanceLossPercent = Math.round((100 - lineBalanceRatioPercent) * 10) / 10;
  const averageOEEPercent = Math.round((sumOEE / numStations) * 10) / 10;
  const lineFPYPercent = Math.round(lineFPYProduct * 1000) / 10;

  const investmentPerGWh = annualGWhOutput > 0 ? Math.round((totalEquipmentCost / annualGWhOutput) * 10) / 10 : 0;

  return {
    lineModelId: model.id,
    calculatedAt: new Date().toISOString(),
    availableMinutesPerDay,
    availableMinutesPerYear,
    lineTaktTimeMin: Math.round(lineTaktTimeMin * 100) / 100,
    demandTaktTimeMin,
    dailyUnitsOutput,
    dailyMWhOutput,
    annualUnitsOutput,
    annualGWhOutput,
    capacityTargetMetPercent,
    lineBalanceRatioPercent,
    balanceLossPercent,
    bottleneckStationCode: bottleneckSt?.code || 'ST-NA',
    bottleneckStationName: bottleneckSt?.name || '未知工站',
    bottleneckCycleTimeMin: Math.round(lineTaktTimeMin * 100) / 100,
    lineFPYPercent,
    averageOEEPercent,
    totalOperators,
    totalEquipmentCost,
    totalFootprintSqM,
    investmentPerGWh,
    stationMetrics
  };
}
