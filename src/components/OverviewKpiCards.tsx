import React from 'react';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  Users, 
  Activity,
  Gauge,
  ArrowUpRight
} from 'lucide-react';
import { CapacityCalculationResult, ProductionLineModel } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface OverviewKpiCardsProps {
  result: CapacityCalculationResult;
  model: ProductionLineModel;
  isWhatIfActive?: boolean;
  baselineResult?: CapacityCalculationResult | null;
  lang?: Language;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  result,
  model,
  isWhatIfActive = false,
  baselineResult,
  lang = 'zh'
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      {/* 1. Annual Capacity GWh - Styled in Sage/Olive Accent Card like Reference */}
      <div className="bg-[#7a8a77] dark:bg-[#283526] text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group transition">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-white/80 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-amber-400 rounded-full inline-block"></span>
              {t.annualCapacity}
            </span>
            <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {result.annualGWhOutput}
            </span>
            <span className="text-xs font-mono text-amber-300 font-bold">GWh</span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
          <span>{t.target}: {model.targetAnnualGWh} GWh</span>
          <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {t.targetMet} {result.capacityTargetMetPercent}%
          </span>
        </div>
        {isWhatIfActive && deltaGWh !== 0 && (
          <div className="mt-1 text-[10px] font-mono font-bold flex items-center justify-between text-white/80">
            <span>{t.vsBase}:</span>
            <span className={deltaGWh > 0 ? 'text-amber-300' : 'text-rose-300'}>
              {deltaGWh > 0 ? `+${deltaGWh}` : deltaGWh} GWh
            </span>
          </div>
        )}
      </div>

      {/* 2. Daily Output Units & MWh */}
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-teal-500 rounded-full inline-block"></span>
              {t.dailyOutput}
            </span>
            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {result.dailyMWhOutput}
            </span>
            <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">{t.unitMwhDay}</span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t.dailyUnits}:</span>
          <span className="text-teal-600 dark:text-teal-300 font-mono font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full text-[10px]">{result.dailyUnitsOutput} {t.unitContainers}</span>
        </div>
      </div>

      {/* 3. Line Takt Time */}
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block"></span>
              {t.actualTakt}
            </span>
            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {result.lineTaktTimeMin}
            </span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">{t.unitMinPerUnit}</span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t.demandTakt}:</span>
          <span className="text-indigo-600 dark:text-indigo-300 font-mono font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-[10px]">{result.demandTaktTimeMin} {t.unitMin}</span>
        </div>
        {isWhatIfActive && deltaTakt !== 0 && (
          <div className="mt-1 text-[10px] font-mono font-bold flex items-center justify-between">
            <span className="text-slate-400">{t.vsBase}:</span>
            <span className={deltaTakt < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {deltaTakt > 0 ? `+${deltaTakt}` : deltaTakt} {t.unitMin}
            </span>
          </div>
        )}
      </div>

      {/* 4. Line Balance Rate */}
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
              {t.lineBalanceRate}
            </span>
            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold font-mono ${
              result.lineBalanceRatioPercent >= 80 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {result.lineBalanceRatioPercent}<span className="text-lg text-teal-600 dark:text-teal-400">%</span>
            </span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t.balanceLoss}:</span>
          <span className="text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full text-[10px]">{result.balanceLossPercent}%</span>
        </div>
        {isWhatIfActive && deltaBalance !== 0 && (
          <div className="mt-1 text-[10px] font-mono font-bold flex items-center justify-between">
            <span className="text-slate-400">{t.vsBase}:</span>
            <span className={deltaBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {deltaBalance > 0 ? `+${deltaBalance}` : deltaBalance}%
            </span>
          </div>
        )}
      </div>

      {/* 5. Bottleneck Station */}
      <div className="bg-orange-500/10 dark:bg-orange-950/30 rounded-3xl p-5 border-2 border-orange-500/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              {t.bottleneckStation}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">
              {result.bottleneckStationCode}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-2">
            {result.bottleneckStationName}
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-orange-200/80 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t.cycleTime}:</span>
          <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">{result.bottleneckCycleTimeMin} {t.unitMin}</span>
        </div>
      </div>

      {/* 6. First Pass Yield & Capex */}
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-violet-500 rounded-full inline-block"></span>
              {t.lineFPY}
            </span>
            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {result.lineFPYPercent}<span className="text-lg text-slate-400">%</span>
            </span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t.staffCapex}:</span>
          <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{result.totalOperators}{t.staffUnit} / ￥{result.totalEquipmentCost}{t.capexUnit}</span>
        </div>
      </div>

    </div>
  );
};

