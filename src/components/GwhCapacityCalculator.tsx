import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  Sliders, 
  RotateCcw,
  Check,
  TrendingUp,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  Info,
  GitFork,
  SlidersHorizontal
} from 'lucide-react';
import { ProductionLineModel, StationParameter, CapacityCalculationResult } from '../types/bess';
import { BESS_CONTAINER_SPECS, DEFAULT_LINE_MODELS } from '../utils/defaultPresets';
import { Language } from '../utils/i18n';

interface GwhCapacityCalculatorProps {
  model: ProductionLineModel;
  result: CapacityCalculationResult;
  onUpdateModel: (updatedModel: ProductionLineModel) => void;
  lang?: Language;
}

export const GwhCapacityCalculator: React.FC<GwhCapacityCalculatorProps> = ({
  model,
  result,
  onUpdateModel,
  lang = 'zh'
}) => {
  // Mode selection: 'single' (单产品产能测算) vs 'mixed' (多产品混线柔性生产测算)
  const [productionMode, setProductionMode] = useState<'single' | 'mixed'>('single');

  // Local state for interactive target GWh and product spec
  const [targetGWh, setTargetGWh] = useState<number>(model.targetAnnualGWh || 15.0);
  const [selectedSpecKey, setSelectedSpecKey] = useState<string>(
    Object.keys(BESS_CONTAINER_SPECS).find(
      k => BESS_CONTAINER_SPECS[k].energyCapacityMWh === model.containerSpec.energyCapacityMWh
    ) || 'L5000'
  );

  // Operating schedule state (derived initially from model)
  const [operatingDays, setOperatingDays] = useState<number>(model.shiftConfig.operatingDaysPerYear || 330);
  const [shiftsPerDay, setShiftsPerDay] = useState<number>(model.shiftConfig.shiftsPerDay || 3);
  const [hoursPerShift, setHoursPerShift] = useState<number>(model.shiftConfig.hoursPerShift || 8.0);
  const [downtimeMinPerShift, setDowntimeMinPerShift] = useState<number>(model.shiftConfig.plannedDowntimeMinPerShift || 20);
  const [targetOEE, setTargetOEE] = useState<number>(90); // Default 90% target OEE

  // Mixed Line Multi-Product Ratio State (%)
  const [mixRatios, setMixRatios] = useState<Record<string, number>>({
    S3440: 20, // 3.44MWh (20%)
    L5000: 50, // 5.01MWh (50%)
    L6250: 30  // 6.25MWh (30%)
  });

  // Helper to handle product spec change
  const handleSelectProductSpec = (specKey: string) => {
    setSelectedSpecKey(specKey);
    const spec = BESS_CONTAINER_SPECS[specKey];
    if (!spec) return;

    // Dynamically adjust station standard times according to product scale (PACK & Cluster ratio)
    const baselineSpecMWh = 5.01;
    const workScaleFactor = spec.energyCapacityMWh / baselineSpecMWh;

    const updatedStations = model.stations.map(st => {
      // Scale PACK/CLUSTER/TEST process times according to spec weight
      let timeMultiplier = 1.0;
      if (['PACK', 'CLUSTER', 'TEST'].includes(st.category)) {
        timeMultiplier = 0.7 + (workScaleFactor * 0.3);
      }
      return {
        ...st,
        standardTimeSec: Math.round(st.standardTimeSec * timeMultiplier)
      };
    });

    onUpdateModel({
      ...model,
      containerSpec: spec,
      targetAnnualGWh: targetGWh,
      stations: updatedStations
    });
  };

  // Helper to apply preset capacity model
  const handleSelectCapacityPreset = (targetPresetGWh: number) => {
    setTargetGWh(targetPresetGWh);
    const matchingPreset = DEFAULT_LINE_MODELS.find(p => p.targetAnnualGWh === targetPresetGWh);
    if (matchingPreset) {
      onUpdateModel({
        ...matchingPreset,
        containerSpec: BESS_CONTAINER_SPECS[selectedSpecKey] || matchingPreset.containerSpec
      });
    } else {
      onUpdateModel({
        ...model,
        targetAnnualGWh: targetPresetGWh
      });
    }
  };

  // Calculate Normalized Mixed Ratios
  const normalizedMixRatios = useMemo(() => {
    const total = (mixRatios.S3440 || 0) + (mixRatios.L5000 || 0) + (mixRatios.L6250 || 0);
    if (total === 0) return { S3440: 0.33, L5000: 0.33, L6250: 0.34 };
    return {
      S3440: (mixRatios.S3440 || 0) / total,
      L5000: (mixRatios.L5000 || 0) / total,
      L6250: (mixRatios.L6250 || 0) / total,
    };
  }, [mixRatios]);

  // Compute Weighted Average Container Capacity (MWh/unit)
  const weightedMeanEnergyMWh = useMemo(() => {
    if (productionMode === 'single') {
      return BESS_CONTAINER_SPECS[selectedSpecKey]?.energyCapacityMWh || 5.01;
    }
    return (
      (normalizedMixRatios.S3440 * 3.44) +
      (normalizedMixRatios.L5000 * 5.01) +
      (normalizedMixRatios.L6250 * 6.25)
    );
  }, [productionMode, selectedSpecKey, normalizedMixRatios]);

  // Capacity Math Calculations
  const calcResults = useMemo(() => {
    // 1. Operating Time
    const netShiftMinutes = Math.max(10, (hoursPerShift * 60) - downtimeMinPerShift);
    const netDailyMinutes = netShiftMinutes * shiftsPerDay;
    const netAnnualMinutes = netDailyMinutes * operatingDays;

    // 2. Total Required Output Units
    const annualTargetMWh = targetGWh * 1000;
    const requiredAnnualUnits = Math.ceil(annualTargetMWh / Math.max(0.1, weightedMeanEnergyMWh));
    const requiredDailyUnits = Math.ceil((requiredAnnualUnits / Math.max(1, operatingDays)) * 10) / 10;
    const requiredShiftUnits = Math.ceil((requiredDailyUnits / Math.max(1, shiftsPerDay)) * 10) / 10;

    // 3. Required Line Takt Time (min/unit and sec/unit)
    const oeeFactor = Math.max(0.1, Math.min(1.0, targetOEE / 100));
    const effectiveDailyOperatingMinutes = netDailyMinutes * oeeFactor;
    
    const requiredTaktTimeMin = Math.max(0.01, effectiveDailyOperatingMinutes / Math.max(0.01, requiredDailyUnits));
    const requiredTaktTimeSec = requiredTaktTimeMin * 60;

    // 4. Station Machine Requirements
    const stationRequirements = model.stations.map(st => {
      // Base station cycle time in minutes
      const baseCtMin = st.standardTimeSec / 60;
      
      // Effective cycle time with current parallel lanes
      const currentEffectiveCtMin = baseCtMin / Math.max(1, st.parallelLanes);

      // Required parallel machines to achieve requiredTaktTimeMin
      const recommendedParallel = Math.max(1, Math.ceil(baseCtMin / requiredTaktTimeMin));
      const machinesDelta = recommendedParallel - st.parallelLanes;

      // New effective CT if recommended machines are used
      const recommendedEffectiveCtMin = baseCtMin / recommendedParallel;

      // Station utilization percentage at target takt
      const utilizationAtTarget = Math.round((recommendedEffectiveCtMin / requiredTaktTimeMin) * 100);

      const isSufficient = st.parallelLanes >= recommendedParallel;

      return {
        ...st,
        baseCtMin,
        baseCtSec: st.standardTimeSec,
        currentEffectiveCtMin,
        recommendedParallel,
        machinesDelta,
        recommendedEffectiveCtMin,
        utilizationAtTarget,
        isSufficient
      };
    });

    // Total capex delta & operator delta
    const totalCapexDeltaTenThousand = stationRequirements.reduce((sum, st) => {
      if (st.machinesDelta > 0) {
        return sum + (st.machinesDelta * st.equipmentCostTenThousand);
      }
      return sum;
    }, 0);

    const totalOperatorDelta = stationRequirements.reduce((sum, st) => {
      if (st.machinesDelta > 0) {
        return sum + (st.machinesDelta * st.operatorsCount);
      }
      return sum;
    }, 0);

    const isCurrentLineAchievable = result.lineTaktTimeMin <= requiredTaktTimeMin;

    return {
      netDailyMinutes,
      netAnnualMinutes,
      requiredAnnualUnits,
      requiredDailyUnits,
      requiredShiftUnits,
      requiredTaktTimeMin: Math.round(requiredTaktTimeMin * 100) / 100,
      requiredTaktTimeSec: Math.round(requiredTaktTimeSec * 10) / 10,
      stationRequirements,
      totalCapexDeltaTenThousand,
      totalOperatorDelta,
      isCurrentLineAchievable
    };
  }, [
    targetGWh, 
    weightedMeanEnergyMWh, 
    operatingDays, 
    shiftsPerDay, 
    hoursPerShift, 
    downtimeMinPerShift, 
    targetOEE, 
    model.stations,
    result.lineTaktTimeMin
  ]);

  // Apply single station parallel machines
  const handleApplySingleStation = (stationId: string, recommendedParallel: number) => {
    const updatedStations = model.stations.map(st => {
      if (st.id === stationId) {
        return {
          ...st,
          parallelLanes: recommendedParallel,
          machinesCount: recommendedParallel
        };
      }
      return st;
    });

    onUpdateModel({
      ...model,
      targetAnnualGWh: targetGWh,
      shiftConfig: {
        ...model.shiftConfig,
        operatingDaysPerYear: operatingDays,
        shiftsPerDay: shiftsPerDay as 1 | 2 | 3,
        hoursPerShift: hoursPerShift,
        plannedDowntimeMinPerShift: downtimeMinPerShift
      },
      containerSpec: BESS_CONTAINER_SPECS[selectedSpecKey] || model.containerSpec,
      stations: updatedStations
    });
  };

  // Apply ALL recommended parallel machines to the active line model
  const handleApplyAllRecommendations = () => {
    const updatedStations = model.stations.map(st => {
      const req = calcResults.stationRequirements.find(r => r.id === st.id);
      if (req) {
        return {
          ...st,
          parallelLanes: req.recommendedParallel,
          machinesCount: req.recommendedParallel
        };
      }
      return st;
    });

    onUpdateModel({
      ...model,
      targetAnnualGWh: targetGWh,
      targetTaktTimeMin: calcResults.requiredTaktTimeMin,
      shiftConfig: {
        ...model.shiftConfig,
        operatingDaysPerYear: operatingDays,
        shiftsPerDay: shiftsPerDay as 1 | 2 | 3,
        hoursPerShift: hoursPerShift,
        plannedDowntimeMinPerShift: downtimeMinPerShift
      },
      containerSpec: {
        ...model.containerSpec,
        energyCapacityMWh: Math.round(weightedMeanEnergyMWh * 100) / 100
      },
      stations: updatedStations
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="apple-card p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <Calculator className="w-5 h-5 opacity-80" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'en' ? 'GWh Target Capacity & Dynamic Takt Calculator' : 'GWh 目标产能与工站节拍精细化测算器'}</span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                    Line Planning Engineer
                  </span>
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                  {lang === 'en' 
                    ? 'Flexible bidirectional selection: Capacity Tiers (5/10/15/20GWh) & Product Specs (3.44/5.01/6.25MWh) + Multi-Product Mixed Line Simulation.' 
                    : '支持【先选产能再配产品】或【先选产品再配产能】双向搭配，以及多种规格储能集装箱柔性混线生产测算。'}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Single Product vs Mixed-Line Flexible Production */}
          <div className="apple-pill shrink-0">
            <button
              onClick={() => setProductionMode('single')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                productionMode === 'single'
                  ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>{lang === 'en' ? 'Single Product Line' : '单产品产线测算'}</span>
            </button>
            <button
              onClick={() => setProductionMode('mixed')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                productionMode === 'mixed'
                  ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>{lang === 'en' ? 'Mixed Multi-Product Line' : '多种产品混线生产测算'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Capacity Presets & Product Spec Pairing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Decoupled Selection: Capacity Tiers vs Product Specs */}
        <div className="apple-card p-6 space-y-6">
          
          {/* Target Capacity Tier Selection (5 -> 10 -> 15 -> 20 GWh) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-[#007AFF]" />
                <span>{lang === 'en' ? '1. Target Capacity Tier (Low to High):' : '1. 目标产能规模 (由小到大排序):'}</span>
              </span>
              <span className="text-[10px] text-slate-400">GWh/yr</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { gwh: 5, label: '5GWh 精益产线' },
                { gwh: 10, label: '10GWh 智能化' },
                { gwh: 15, label: '15GWh 标杆产线' },
                { gwh: 20, label: '20GWh 超级工厂' }
              ].map((tier) => (
                <button
                  key={tier.gwh}
                  onClick={() => handleSelectCapacityPreset(tier.gwh)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                    targetGWh === tier.gwh
                      ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF] font-medium'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-black/10'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{tier.gwh} GWh</span>
                    {targetGWh === tier.gwh && <Check className="w-3.5 h-3.5 text-[#007AFF]" />}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {tier.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Specification Pairing (3.44 -> 5.01 -> 6.25 MWh) */}
          <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
            <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#007AFF]" />
                <span>{lang === 'en' ? '2. Container Product Spec (Low to High):' : '2. 搭配集装箱产品规格 (由小到大排序):'}</span>
              </span>
              <span className="text-[10px] text-slate-400">MWh/unit</span>
            </label>

            <div className="space-y-2">
              {Object.entries(BESS_CONTAINER_SPECS).map(([key, spec]) => (
                <button
                  key={key}
                  onClick={() => handleSelectProductSpec(key)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedSpecKey === key
                      ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-black/10'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{spec.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                      {spec.packCount} PACKs · {spec.clusterCount} Clusters · {spec.voltageLevelV}V
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    selectedSpecKey === key
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-black/[0.05] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                  }`}>
                    {spec.energyCapacityMWh} MWh
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Card 2: Operating Schedule OR Mixed Line Configurator */}
        {productionMode === 'single' ? (
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
              <span className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#007AFF]">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Operating Schedule & Line OEE' : '班制开工时间与综合 OEE 设定'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'en' ? 'Custom Target Volume (GWh):' : '自定义目标年产出能量 (GWh):'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    max={50}
                    value={targetGWh}
                    onChange={(e) => setTargetGWh(parseFloat(e.target.value) || 1)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] font-mono font-bold text-[#007AFF] px-3.5 py-2 rounded-2xl text-base focus:outline-none focus:border-[#007AFF]"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-400">GWh</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Operating Days/Year' : '年开工天数 (天)'}
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={365}
                    value={operatingDays}
                    onChange={(e) => setOperatingDays(parseInt(e.target.value) || 250)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] font-mono font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Shifts per Day' : '每日工作班次'}
                  </label>
                  <select
                    value={shiftsPerDay}
                    onChange={(e) => setShiftsPerDay(parseInt(e.target.value) as any)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] font-mono font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  >
                    <option value={1}>1 班 (8-10.5h)</option>
                    <option value={2}>2 班 (双班倒)</option>
                    <option value={3}>3 班 (三班倒)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Hours / Shift' : '单班工作时长 (h)'}
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={4}
                    max={12}
                    value={hoursPerShift}
                    onChange={(e) => setHoursPerShift(parseFloat(e.target.value) || 8)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] font-mono font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Planned Downtime' : '单班计划停机 (分)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={downtimeMinPerShift}
                    onChange={(e) => setDowntimeMinPerShift(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] font-mono font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    {lang === 'en' ? 'Target Line OEE (%)' : '目标综合设备效率 (OEE %)'}
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#007AFF]">
                    {targetOEE}%
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={98}
                  value={targetOEE}
                  onChange={(e) => setTargetOEE(parseInt(e.target.value))}
                  className="w-full accent-[#007AFF]"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Card 2: Mixed Multi-Product Configurator */
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
              <span className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#007AFF]">
                <GitFork className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Mixed Production Ratio Config' : '多种产品混线生产占比配置 (%)'}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {lang === 'en' ? 'Configure product mix ratio for flex manufacturing' : '设置 3.44MWh, 5.01MWh, 6.25MWh 混线制造比例'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'S3440', spec: BESS_CONTAINER_SPECS.S3440 },
                { key: 'L5000', spec: BESS_CONTAINER_SPECS.L5000 },
                { key: 'L6250', spec: BESS_CONTAINER_SPECS.L6250 }
              ].map(({ key, spec }) => (
                <div key={key} className="space-y-1 bg-black/[0.02] dark:bg-white/[0.04] p-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{spec.name}</span>
                    <span className="font-mono font-bold text-[#007AFF]">
                      {Math.round(normalizedMixRatios[key as keyof typeof normalizedMixRatios] * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mixRatios[key] || 0}
                    onChange={(e) => setMixRatios({ ...mixRatios, [key]: parseInt(e.target.value) || 0 })}
                    className="w-full accent-[#007AFF]"
                  />
                </div>
              ))}

              <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between items-center font-semibold text-slate-900 dark:text-white">
                  <span>{lang === 'en' ? 'Weighted Mean Capacity:' : '混线加权平均容量:'}</span>
                  <span className="font-mono text-sm font-bold text-[#007AFF]">{weightedMeanEnergyMWh.toFixed(2)} MWh/台</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {lang === 'en' 
                    ? 'Line balancing and takt time automatically compute weighted average cycle time across mixed products.' 
                    : '产线节拍与设备通道将按加权平均单体容量与混线工时系数进行动态节拍平衡。'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Key Calculated Takt Targets Summary */}
        <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white p-5 rounded-3xl border border-black/[0.05] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#007AFF]" />
                <span>{lang === 'en' ? '3. Required Capacity Targets' : '3. 目标测算核心指标'}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                calcResults.isCurrentLineAchievable 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {calcResults.isCurrentLineAchievable 
                  ? (lang === 'en' ? 'Current Line Met' : '当前产线满足需求')
                  : (lang === 'en' ? 'Expansion Needed' : '需增配扩产工站')}
              </span>
            </div>

            {/* Target Takt Box */}
            <div className="bg-black/[0.02] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                <span>{lang === 'en' ? 'Required Line Takt Time' : '达成目标必须的生产节拍 (TAKT)'}</span>
                {productionMode === 'mixed' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#007AFF]/10 text-[#007AFF] font-medium">
                    混线柔性模式
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-bold font-mono text-[#007AFF]">
                  {calcResults.requiredTaktTimeMin}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'min/container' : '分钟/台舱'} ({calcResults.requiredTaktTimeSec} {lang === 'en' ? 'sec' : '秒'})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-black/[0.05] dark:border-white/[0.06] pt-2 mt-2 flex justify-between">
                <span>{lang === 'en' ? 'Current Actual Takt:' : '当前实际瓶颈节拍:'}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{result.lineTaktTimeMin} min</span>
              </div>
            </div>

            {/* Throughput Requirements Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">{lang === 'en' ? 'Req. Daily Units:' : '需求日出货数量:'}</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">{calcResults.requiredDailyUnits}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{lang === 'en' ? 'units/day' : '台/日'}</span>
              </div>

              <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">{lang === 'en' ? 'Req. Annual Units:' : '需求年出货总量:'}</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">{calcResults.requiredAnnualUnits}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{lang === 'en' ? 'units/yr' : '台/年'}</span>
              </div>
            </div>
          </div>

          {/* Action Button: Apply All Recommendations */}
          <button
            onClick={handleApplyAllRecommendations}
            className="w-full py-3 px-4 rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white font-medium text-xs tracking-wide shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'en' ? 'Apply Recommended Parallel Stations to Line Model' : '一键应用推荐设备通道配置至当前产线'}</span>
          </button>
        </div>

      </div>

      {/* Detailed Station-by-Station Requirement Matrix Table */}
      <div className="apple-card overflow-hidden">
        
        {/* Table Header */}
        <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#007AFF]">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Station Cycle Time & Equipment Parallel Capacity Breakdown' : '全线工站周期时间 (CT) 与平行设备需求测算表'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {lang === 'en' 
                  ? 'Displays current vs required parallel lanes and effective cycle time for each station to satisfy target Takt.' 
                  : '对比各工站基础周期、当前并行台数与达成目标节拍所需的推荐平行设备通道数'}
              </p>
            </div>
          </div>

          {calcResults.totalCapexDeltaTenThousand > 0 && (
            <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{lang === 'en' ? 'Capex Increase:' : '新增设备 Capex:'}</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">￥{calcResults.totalCapexDeltaTenThousand}万</span>
            </div>
          )}
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.04] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                <th className="py-3 px-4">{lang === 'en' ? 'Station Code & Name' : '工站编号 / 名称'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'Process Category' : '工序类别'}</th>
                <th className="py-3 px-3 text-right">{lang === 'en' ? 'Base CT (min)' : '基础单站 CT'}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? 'Current Lanes' : '当前并行通道'}</th>
                <th className="py-3 px-3 text-right">{lang === 'en' ? 'Current Effective CT' : '当前实际 CT'}</th>
                <th className="py-3 px-3 text-center bg-[#007AFF]/10 text-[#007AFF]">{lang === 'en' ? 'Recommended Lanes' : '目标推荐通道'}</th>
                <th className="py-3 px-3 text-right bg-[#007AFF]/10 text-[#007AFF]">{lang === 'en' ? 'New Effective CT' : '推荐后实际 CT'}</th>
                <th className="py-3 px-3 text-right">{lang === 'en' ? 'Target Load %' : '目标负荷率'}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? 'Status' : '状态评估'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Quick Apply' : '快速调整'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
              {calcResults.stationRequirements.map((st) => (
                <tr 
                  key={st.id}
                  className={`hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors ${
                    !st.isSufficient ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Station Code & Name */}
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                        {st.code}
                      </span>
                      <span>{st.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
                      {st.category}
                    </span>
                  </td>

                  {/* Base CT */}
                  <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {st.baseCtMin.toFixed(1)} <span className="text-[10px] text-slate-400">min</span>
                  </td>

                  {/* Current Lanes */}
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {st.parallelLanes} {lang === 'en' ? 'lanes' : '通道'}
                  </td>

                  {/* Current Effective CT */}
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {st.currentEffectiveCtMin.toFixed(2)} <span className="text-[10px] text-slate-400">min</span>
                  </td>

                  {/* Recommended Lanes */}
                  <td className="py-3 px-3 text-center font-mono font-bold bg-[#007AFF]/10 text-[#007AFF]">
                    {st.recommendedParallel} {lang === 'en' ? 'lanes' : '通道'}
                  </td>

                  {/* Recommended Effective CT */}
                  <td className="py-3 px-3 text-right font-mono font-semibold bg-[#007AFF]/10 text-[#007AFF]">
                    {st.recommendedEffectiveCtMin.toFixed(2)} <span className="text-[10px] text-slate-400">min</span>
                  </td>

                  {/* Utilization */}
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    <span className={
                      st.utilizationAtTarget > 90 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }>
                      {st.utilizationAtTarget}%
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {st.isSufficient ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{lang === 'en' ? 'Sufficient' : '充足'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>+{st.machinesDelta} {lang === 'en' ? 'Expand' : '扩产'}</span>
                      </span>
                    )}
                  </td>

                  {/* Quick Action Button */}
                  <td className="py-3 px-4 text-right">
                    {!st.isSufficient ? (
                      <button
                        onClick={() => handleApplySingleStation(st.id, st.recommendedParallel)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#007AFF] hover:bg-[#0066CC] text-white transition active:scale-95 shadow-xs"
                      >
                        {lang === 'en' ? `Set ${st.recommendedParallel} Lanes` : `扩至 ${st.recommendedParallel} 通道`}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
