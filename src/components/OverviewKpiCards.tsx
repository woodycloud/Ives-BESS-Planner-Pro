import React from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  Calculator, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { CapacityCalculationResult, ProductionLineModel } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface OverviewKpiCardsProps {
  result: CapacityCalculationResult;
  model: ProductionLineModel;
  isWhatIfActive?: boolean;
  baselineResult?: CapacityCalculationResult | null;
  lang?: Language;
  onNavigateToGwhCalc?: () => void;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  result,
  model,
  isWhatIfActive = false,
  baselineResult,
  lang = 'zh',
  onNavigateToGwhCalc
}) => {
  const t = translations[lang].kpi;

  // Compute deltas if what-if mode is enabled
  const deltaGWh = baselineResult 
    ? Math.round((result.annualGWhOutput - baselineResult.annualGWhOutput) * 1000) / 1000 
    : 0;
  const deltaTakt = baselineResult 
    ? Math.round((result.lineTaktTimeMin - baselineResult.lineTaktTimeMin) * 100) / 100 
    : 0;
  const deltaBalance = baselineResult 
    ? Math.round((result.lineBalanceRatioPercent - baselineResult.lineBalanceRatioPercent) * 10) / 10 
    : 0;

  return (
    <div className="space-y-4">
      {/* Active Model Overview Glass Card */}
      <div className="apple-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Model Summary */}
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <Activity className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                  {model.name}
                </h3>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                  {model.containerSpec.name} ({model.containerSpec.energyCapacityMWh} MWh/舱)
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-3 font-normal">
                <span>{lang === 'en' ? 'Operating Days:' : '年开工:'} <strong className="font-semibold text-slate-700 dark:text-slate-300">{model.shiftConfig.operatingDaysPerYear}天 ({model.shiftConfig.shiftsPerDay}班倒)</strong></span>
                <span>•</span>
                <span>{lang === 'en' ? 'Target Capacity:' : '目标年产能:'} <strong className="font-semibold text-slate-700 dark:text-slate-300">{model.targetAnnualGWh} GWh</strong></span>
              </p>
            </div>
          </div>

          {/* Precision GWh Calculator Banner Button */}
          <div className="flex items-center space-x-4 bg-black/[0.02] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.02] dark:border-white/[0.04]">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-end space-x-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{lang === 'en' ? 'Precision GWh Calculator' : 'GWh 产能与节拍精细测算器'}</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {lang === 'en' ? 'Simulate 1-20GWh tiers & station parallel machines' : '精算 1~20GWh 阶梯并自动规划并联设备'}
              </p>
            </div>

            {onNavigateToGwhCalc && (
              <button
                onClick={onNavigateToGwhCalc}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white font-medium text-xs shadow-sm transition-all duration-200 active:scale-95 shrink-0"
              >
                <span>{lang === 'en' ? 'Open' : '进入测算'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* 1. Annual Capacity GWh */}
        <div className="apple-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full inline-block"></span>
                {t.annualCapacity}
              </span>
              <span className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {result.annualGWhOutput}
              </span>
              <span className="text-xs font-semibold text-[#007AFF]">GWh</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{t.target}: {model.targetAnnualGWh} GWh</span>
            <span className="font-medium bg-blue-500/10 text-[#007AFF] px-2 py-0.5 rounded-full text-[10px]">
              {result.capacityTargetMetPercent}%
            </span>
          </div>
          {isWhatIfActive && deltaGWh !== 0 && (
            <div className="mt-1 text-[10px] font-medium flex items-center justify-between text-slate-400">
              <span>{t.vsBase}:</span>
              <span className={deltaGWh > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {deltaGWh > 0 ? `+${deltaGWh}` : deltaGWh} GWh
              </span>
            </div>
          )}
        </div>

        {/* 2. Daily Output Units & MWh */}
        <div className="apple-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                {t.dailyOutput}
              </span>
              <span className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {result.dailyMWhOutput}
              </span>
              <span className="text-xs font-semibold text-emerald-500">{t.unitMwhDay}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] flex items-center justify-between">
            <span className="text-slate-400">{t.dailyUnits}:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 rounded-full text-[10px]">{result.dailyUnitsOutput} {t.unitContainers}</span>
          </div>
        </div>

        {/* 3. Line Takt Time */}
        <div className="apple-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
                {t.actualTakt}
              </span>
              <span className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {result.lineTaktTimeMin}
              </span>
              <span className="text-xs font-semibold text-indigo-500">{t.unitMinPerUnit}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] flex items-center justify-between">
            <span className="text-slate-400">{t.demandTakt}:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 rounded-full text-[10px]">{result.demandTaktTimeMin} {t.unitMin}</span>
          </div>
          {isWhatIfActive && deltaTakt !== 0 && (
            <div className="mt-1 text-[10px] font-medium flex items-center justify-between">
              <span className="text-slate-400">{t.vsBase}:</span>
              <span className={deltaTakt < 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {deltaTakt > 0 ? `+${deltaTakt}` : deltaTakt} {t.unitMin}
              </span>
            </div>
          )}
        </div>

        {/* 4. Line Balance Rate */}
        <div className="apple-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
                {t.lineBalanceRate}
              </span>
              <span className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {result.lineBalanceRatioPercent}<span className="text-lg text-slate-400">%</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] flex items-center justify-between">
            <span className="text-slate-400">{t.balanceLoss}:</span>
            <span className="text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px]">{result.balanceLossPercent}%</span>
          </div>
          {isWhatIfActive && deltaBalance !== 0 && (
            <div className="mt-1 text-[10px] font-medium flex items-center justify-between">
              <span className="text-slate-400">{t.vsBase}:</span>
              <span className={deltaBalance > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {deltaBalance > 0 ? `+${deltaBalance}` : deltaBalance}%
              </span>
            </div>
          )}
        </div>

        {/* 5. Bottleneck Station */}
        <div className="apple-card p-5 flex flex-col justify-between border-amber-500/20 dark:border-amber-500/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.bottleneckStation}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {result.bottleneckStationCode}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-1">
              {result.bottleneckStationName}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] flex items-center justify-between">
            <span className="text-slate-400">{t.cycleTime}:</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{result.bottleneckCycleTimeMin} {t.unitMin}</span>
          </div>
        </div>

        {/* 6. First Pass Yield & Capex */}
        <div className="apple-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>
                {t.lineFPY}
              </span>
              <span className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {result.lineFPYPercent}<span className="text-lg text-slate-400">%</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] flex items-center justify-between">
            <span className="text-slate-400">{t.staffCapex}:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{result.totalOperators}{t.staffUnit} / ￥{result.totalEquipmentCost}{t.capexUnit}</span>
          </div>
        </div>

      </div>
    </div>
  );
};



