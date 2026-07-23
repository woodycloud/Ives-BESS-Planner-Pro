import React from 'react';
import { CapacityCalculationResult } from '../types/bess';
import { Flame } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface StationHeatmapProps {
  result: CapacityCalculationResult;
  onSelectStation?: (stationId: string) => void;
  lang?: Language;
}

export const StationHeatmap: React.FC<StationHeatmapProps> = ({
  result,
  onSelectStation,
  lang = 'zh'
}) => {
  const t = translations[lang].heatmap;

  const getCategoryBadge = (category: string) => {
    const cats = t.categories;
    switch (category) {
      case 'PREP': return { label: cats.PREP, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
      case 'PACK': return { label: cats.PACK, color: 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
      case 'CLUSTER': return { label: cats.CLUSTER, color: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'ELECTRICAL': return { label: cats.ELECTRICAL, color: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'AUXILIARY': return { label: cats.AUXILIARY, color: 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
      case 'PCS': return { label: cats.PCS, color: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'TEST': return { label: cats.TEST, color: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' };
      case 'PACKAGING': return { label: cats.PACKAGING, color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      default: return { label: cats.DEFAULT, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const getHeatmapColor = (utilization: number, isBottleneck: boolean) => {
    if (isBottleneck) {
      return 'bg-amber-50 dark:bg-orange-950/40 border-amber-300 dark:border-orange-700 text-amber-900 dark:text-orange-100 shadow-sm';
    }
    if (utilization >= 90) {
      return 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-slate-900 dark:text-amber-100';
    }
    if (utilization >= 75) {
      return 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/80 text-slate-900 dark:text-teal-100';
    }
    return 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-slate-300';
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800/80 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>{t.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
            <span>{t.legendBottleneck}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
            <span>{t.legendHigh}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-500 inline-block"></span>
            <span>{t.legendBalanced}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700 inline-block"></span>
            <span>{t.legendLow}</span>
          </span>
        </div>
      </div>

      {/* Grid of Station Heatmap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {result.stationMetrics.map((st) => {
          const categoryBadge = getCategoryBadge(st.category);
          const heatStyle = getHeatmapColor(st.utilizationRatePercent, st.isBottleneck);

          return (
            <div
              key={st.stationId}
              onClick={() => onSelectStation?.(st.stationId)}
              className={`rounded-2xl p-3.5 border transition cursor-pointer hover:scale-[1.02] hover:shadow-md ${heatStyle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {st.code}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryBadge.color}`}>
                  {categoryBadge.label}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate mb-2">
                {st.name}
              </div>

              {/* Utilization Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">{t.utilization}</span>
                  <span className={`font-mono font-bold ${
                    st.isBottleneck ? 'text-rose-600 dark:text-rose-400' : st.utilizationRatePercent >= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-300'
                  }`}>
                    {st.utilizationRatePercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.isBottleneck ? 'bg-rose-500 animate-pulse' : st.utilizationRatePercent >= 90 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, st.utilizationRatePercent)}%` }}
                  ></div>
                </div>
              </div>

              {/* Station Parameters Footer */}
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 font-mono">
                <div>{t.cycleTime}: <b className="text-slate-800 dark:text-slate-200">{st.effectiveCycleTimeMin}{t.minutesUnit}</b></div>
                <div>{t.oee}: <b className="text-slate-800 dark:text-slate-200">{st.effectiveOEEPercent}%</b></div>
                <div>{t.staff}: <b className="text-slate-800 dark:text-slate-200">{st.operatorsTotal}{t.peopleUnit}</b></div>
                <div>{t.capex}: <b className="text-slate-800 dark:text-slate-200">￥{st.equipmentCost}{t.wanUnit}</b></div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

