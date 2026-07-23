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
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-amber-900/40 pb-3">
          <div>
            <h3 className="text-base font-bold text-amber-800 dark:text-amber-200 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <span>What-if 假设分析敏捷仿真器</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              动态调整班次、瓶颈并行线、OEE 综合效率及标准工时，实时评估产线投资回报与产能变动
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetScenario}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复基准配置</span>
            </button>

            <button
              onClick={() => onApplyScenarioToModel(simulatedModel)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>应用至主模型</span>
            </button>
          </div>
        </div>

        {/* Live Delta Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">仿真预估产能 (GWh)</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{simResult.annualGWhOutput} GWh</span>
              <span className={`text-xs font-bold ${deltaGWh >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {deltaGWh > 0 ? `+${deltaGWh}` : deltaGWh}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">基准: {baseResult.annualGWhOutput} GWh</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">仿真日均能量产出 (MWh)</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{simResult.dailyMWhOutput} MWh</span>
              <span className={`text-xs font-bold ${deltaDailyMWh >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {deltaDailyMWh > 0 ? `+${deltaDailyMWh}` : deltaDailyMWh}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">基准: {baseResult.dailyMWhOutput} MWh</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">仿真产线节拍 (分钟)</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{simResult.lineTaktTimeMin} 分钟</span>
              <span className={`text-xs font-bold ${deltaTakt <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {deltaTakt > 0 ? `+${deltaTakt}` : deltaTakt}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">基准: {baseResult.lineTaktTimeMin} 分钟</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">仿真产线平衡率 (%)</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{simResult.lineBalanceRatioPercent}%</span>
              <span className={`text-xs font-bold ${deltaBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {deltaBalance > 0 ? `+${deltaBalance}` : deltaBalance}%
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">基准: {baseResult.lineBalanceRatioPercent}%</div>
          </div>

        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Shifts & Operating Model */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. 班次体制与年工作日设定
          </h4>

          {/* Shifts per day */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">每日班次数量</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{shiftsPerDay} 班制</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setShiftsPerDay(s as 1|2|3)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    shiftsPerDay === s
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-700 dark:text-teal-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {s} 班 ({s === 1 ? '单班8小时' : s === 2 ? '双班10小时' : '三班24小时'})
                </button>
              ))}
            </div>
          </div>

          {/* Operating Days */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">年工作天数 (天/年)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{operatingDays} 天</span>
            </div>
            <input
              type="range"
              min={200}
              max={365}
              step={5}
              value={operatingDays}
              onChange={(e) => setOperatingDays(Number(e.target.value))}
              className="w-full accent-teal-600 dark:accent-cyan-500 bg-slate-100 dark:bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Panel 2: Bottleneck Mitigation & OEE Boost */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
            2. 瓶颈扩容与 OEE 提效
          </h4>

          {/* Bottleneck Parallel Lanes */}
          {baselineBottleneck && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  瓶颈工站 [{baselineBottleneck.code}] 并行通道数量
                </span>
                <span className="text-amber-600 dark:text-rose-400 font-mono font-bold">{bottleneckParallelLanes} 倍通道</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((l) => (
                  <button
                    key={l}
                    onClick={() => setBottleneckParallelLanes(l)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      bottleneckParallelLanes === l
                        ? 'bg-amber-50 dark:bg-rose-950 border-amber-500 dark:border-rose-500 text-amber-800 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l === 1 ? '1倍单通道 (基准)' : `${l}倍并行扩容`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OEE Boost */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">全局 OEE 效率提升 (+%)</span>
              <span className="text-amber-600 dark:text-amber-300 font-mono font-bold">+{globalOeeBoostPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={globalOeeBoostPercent}
              onChange={(e) => setGlobalOeeBoostPercent(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-100 dark:bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Global Cycle Time Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">精益工时压缩 (周期因子)</span>
              <span className="text-sky-600 dark:text-sky-300 font-mono font-bold">
                {Math.round(globalCycleTimeFactor * 100)}% ({globalCycleTimeFactor < 1 ? `减少 ${Math.round((1-globalCycleTimeFactor)*100)}% 工时` : '100% 标准工时'})
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.2}
              step={0.05}
              value={globalCycleTimeFactor}
              onChange={(e) => setGlobalCycleTimeFactor(Number(e.target.value))}
              className="w-full accent-sky-500 bg-slate-100 dark:bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Save Snapshot Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Save className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>将当前仿真结果保存为版本快照</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            保存后可在多方案版本对比矩阵中进行横向指标对标
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={versionNameInput}
            onChange={(e) => setVersionNameInput(e.target.value)}
            placeholder="输入方案版本名称"
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 w-48"
          />
          <button
            onClick={() => onSaveAsVersionSnapshot(versionNameInput, simulatedModel, simResult)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>保存快照</span>
          </button>
        </div>
      </div>

    </div>
  );
};

