import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  RotateCcw,
  CheckCircle2, 
  Save, 
  Sparkles
} from 'lucide-react';
import { ProductionLineModel, CapacityCalculationResult, ShiftConfig } from '../types/bess';
import { calculateLineCapacity } from '../utils/capacityCalculator';
import { Language, translations } from '../utils/i18n';

interface WhatIfSimulatorProps {
  baseModel: ProductionLineModel;
  baseResult: CapacityCalculationResult;
  onApplyScenarioToModel: (simulatedModel: ProductionLineModel) => void;
  onSaveAsVersionSnapshot: (versionName: string, simulatedModel: ProductionLineModel, result: CapacityCalculationResult) => void;
  lang?: Language;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseModel,
  baseResult,
  onApplyScenarioToModel,
  onSaveAsVersionSnapshot,
  lang = 'zh'
}) => {
  const t = translations[lang].whatIf;
  // Scenario state parameters
  const [shiftsPerDay, setShiftsPerDay] = useState<1 | 2 | 3>(baseModel.shiftConfig.shiftsPerDay);
  const [hoursPerShift, setHoursPerShift] = useState(baseModel.shiftConfig.hoursPerShift);
  const [operatingDays, setOperatingDays] = useState(baseModel.shiftConfig.operatingDaysPerYear);
  const [bottleneckParallelLanes, setBottleneckParallelLanes] = useState(1);
  const [globalOeeBoostPercent, setGlobalOeeBoostPercent] = useState(0); // 0 to 15%
  const [globalCycleTimeFactor, setGlobalCycleTimeFactor] = useState(1.0); // 0.7x to 1.3x
  const [versionNameInput, setVersionNameInput] = useState('What-if Optimized Scenario');

  // Find baseline bottleneck
  const baselineBottleneck = baseResult.stationMetrics.find(s => s.isBottleneck);

  // Compute simulated model dynamically
  const simulatedModel = useMemo(() => {
    const updatedShiftConfig: ShiftConfig = {
      ...baseModel.shiftConfig,
      shiftsPerDay,
      hoursPerShift,
      operatingDaysPerYear: operatingDays
    };

    const updatedStations = baseModel.stations.map((st) => {
      let parallelLanes = st.parallelLanes || 1;
      // If it's the bottleneck station, apply parallel lane override
      if (st.id === baselineBottleneck?.stationId) {
        parallelLanes = Math.max(1, (st.parallelLanes || 1) + (bottleneckParallelLanes - 1));
      }

      // Apply cycle time factor
      const standardTimeSec = Math.max(10, Math.round(st.standardTimeSec * globalCycleTimeFactor));

      // Apply OEE boost
      const availabilityRate = Math.min(100, st.availabilityRate + globalOeeBoostPercent);
      const performanceRate = Math.min(100, st.performanceRate + globalOeeBoostPercent);

      return {
        ...st,
        parallelLanes,
        standardTimeSec,
        availabilityRate,
        performanceRate
      };
    });

    return {
      ...baseModel,
      shiftConfig: updatedShiftConfig,
      stations: updatedStations
    };
  }, [
    baseModel,
    shiftsPerDay,
    hoursPerShift,
    operatingDays,
    bottleneckParallelLanes,
    globalOeeBoostPercent,
    globalCycleTimeFactor,
    baselineBottleneck
  ]);

  // Compute simulated result
  const simResult = useMemo(() => calculateLineCapacity(simulatedModel), [simulatedModel]);

  // Deltas against baseline
  const deltaGWh = Math.round((simResult.annualGWhOutput - baseResult.annualGWhOutput) * 1000) / 1000;
  const deltaDailyMWh = Math.round((simResult.dailyMWhOutput - baseResult.dailyMWhOutput) * 10) / 10;
  const deltaTakt = Math.round((simResult.lineTaktTimeMin - baseResult.lineTaktTimeMin) * 100) / 100;
  const deltaBalance = Math.round((simResult.lineBalanceRatioPercent - baseResult.lineBalanceRatioPercent) * 10) / 10;

  const handleResetScenario = () => {
    setShiftsPerDay(baseModel.shiftConfig.shiftsPerDay);
    setHoursPerShift(baseModel.shiftConfig.hoursPerShift);
    setOperatingDays(baseModel.shiftConfig.operatingDaysPerYear);
    setBottleneckParallelLanes(1);
    setGlobalOeeBoostPercent(0);
    setGlobalCycleTimeFactor(1.0);
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Header */}
      <div className="apple-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.06] pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2 tracking-tight">
              <Sliders className="w-5 h-5 text-[#007AFF]" />
              <span>What-if 假设分析敏捷仿真器</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
              动态调整班次、瓶颈并行线、OEE 综合效率及标准工时，实时评估产线投资回报与产能变动
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleResetScenario}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复基准配置</span>
            </button>

            <button
              onClick={() => onApplyScenarioToModel(simulatedModel)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>应用至主模型</span>
            </button>
          </div>
        </div>

        {/* Live Delta Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{lang === 'en' ? 'Estimated Capacity' : '仿真预估产能 (GWh)'}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{simResult.annualGWhOutput} GWh</span>
              <span className={`text-xs font-semibold ${deltaGWh >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {deltaGWh > 0 ? `+${deltaGWh}` : deltaGWh}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{lang === 'en' ? 'Baseline:' : '基准:'} {baseResult.annualGWhOutput} GWh</div>
          </div>

          <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{lang === 'en' ? 'Daily Output (MWh)' : '仿真日均能量产出 (MWh)'}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{simResult.dailyMWhOutput} MWh</span>
              <span className={`text-xs font-semibold ${deltaDailyMWh >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {deltaDailyMWh > 0 ? `+${deltaDailyMWh}` : deltaDailyMWh}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{lang === 'en' ? 'Baseline:' : '基准:'} {baseResult.dailyMWhOutput} MWh</div>
          </div>

          <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{lang === 'en' ? 'Line Takt (min)' : '仿真产线节拍 (分钟)'}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{simResult.lineTaktTimeMin} min</span>
              <span className={`text-xs font-semibold ${deltaTakt <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {deltaTakt > 0 ? `+${deltaTakt}` : deltaTakt}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{lang === 'en' ? 'Baseline:' : '基准:'} {baseResult.lineTaktTimeMin} min</div>
          </div>

          <div className="bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{lang === 'en' ? 'Line Balance (%)' : '仿真产线平衡率 (%)'}</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{simResult.lineBalanceRatioPercent}%</span>
              <span className={`text-xs font-semibold ${deltaBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {deltaBalance > 0 ? `+${deltaBalance}` : deltaBalance}%
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{lang === 'en' ? 'Baseline:' : '基准:'} {baseResult.lineBalanceRatioPercent}%</div>
          </div>

        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Shifts & Operating Model */}
        <div className="apple-card p-6 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
            {lang === 'en' ? '1. Shift System & Operating Days' : '1. 班次体制与年工作日设定'}
          </h4>

          {/* Shifts per day */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === 'en' ? 'Shifts per Day' : '每日班次数量'}</span>
              <span className="text-[#007AFF] font-mono font-semibold">{shiftsPerDay} {lang === 'en' ? 'shifts' : '班制'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setShiftsPerDay(s as 1|2|3)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    shiftsPerDay === s
                      ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-black/[0.04]'
                  }`}
                >
                  {s} {lang === 'en' ? 'Shift' : '班'} ({s === 1 ? '8h' : s === 2 ? '双班10h' : '三班24h'})
                </button>
              ))}
            </div>
          </div>

          {/* Operating Days */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === 'en' ? 'Operating Days / Year' : '年工作天数 (天/年)'}</span>
              <span className="text-emerald-500 font-mono font-semibold">{operatingDays} {lang === 'en' ? 'days' : '天'}</span>
            </div>
            <input
              type="range"
              min={200}
              max={365}
              step={5}
              value={operatingDays}
              onChange={(e) => setOperatingDays(Number(e.target.value))}
              className="w-full accent-[#007AFF]"
            />
          </div>
        </div>

        {/* Panel 2: Bottleneck Mitigation & OEE Boost */}
        <div className="apple-card p-6 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
            {lang === 'en' ? '2. Bottleneck Parallel & OEE Optimization' : '2. 瓶颈扩容与 OEE 提效'}
          </h4>

          {/* Bottleneck Parallel Lanes */}
          {baselineBottleneck && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'en' ? `Bottleneck [${baselineBottleneck.code}] Lanes` : `瓶颈工站 [${baselineBottleneck.code}] 并行通道数量`}
                </span>
                <span className="text-amber-500 font-mono font-semibold">{bottleneckParallelLanes} {lang === 'en' ? 'lanes' : '通道'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((l) => (
                  <button
                    key={l}
                    onClick={() => setBottleneckParallelLanes(l)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                      bottleneckParallelLanes === l
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-black/[0.04]'
                    }`}
                  >
                    {l === 1 ? (lang === 'en' ? '1 Lane (Base)' : '1通道 (基准)') : `${l} ${lang === 'en' ? 'Lanes' : '通道扩容'}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OEE Boost */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === 'en' ? 'Global OEE Boost (+%)' : '全局 OEE 效率提升 (+%)'}</span>
              <span className="text-amber-500 font-mono font-semibold">+{globalOeeBoostPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={globalOeeBoostPercent}
              onChange={(e) => setGlobalOeeBoostPercent(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Global Cycle Time Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === 'en' ? 'Cycle Time Compression Factor' : '精益工时压缩 (周期因子)'}</span>
              <span className="text-[#007AFF] font-mono font-semibold">
                {Math.round(globalCycleTimeFactor * 100)}% ({globalCycleTimeFactor < 1 ? `-${Math.round((1-globalCycleTimeFactor)*100)}%` : '100%'})
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.2}
              step={0.05}
              value={globalCycleTimeFactor}
              onChange={(e) => setGlobalCycleTimeFactor(Number(e.target.value))}
              className="w-full accent-[#007AFF]"
            />
          </div>
        </div>

      </div>

      {/* Save Snapshot Section */}
      <div className="apple-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <Save className="w-4 h-4 text-[#007AFF]" />
            <span>{lang === 'en' ? 'Save Simulation as Version Snapshot' : '将当前仿真结果保存为版本快照'}</span>
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {lang === 'en' ? 'Compare saved snapshots side-by-side in Version Comparison' : '保存后可在多方案版本对比矩阵中进行横向指标对标'}
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={versionNameInput}
            onChange={(e) => setVersionNameInput(e.target.value)}
            placeholder={lang === 'en' ? 'Scenario name...' : '输入方案版本名称'}
            className="bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#007AFF] w-48 font-medium"
          />
          <button
            onClick={() => onSaveAsVersionSnapshot(versionNameInput, simulatedModel, simResult)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'en' ? 'Save Snapshot' : '保存快照'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

