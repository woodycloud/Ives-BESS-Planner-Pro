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
      case 'PREP': return { label: cats.PREP, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
      case 'PACK': return { label: cats.PACK, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' };
      case 'CLUSTER': return { label: cats.CLUSTER, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'ELECTRICAL': return { label: cats.ELECTRICAL, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      case 'AUXILIARY': return { label: cats.AUXILIARY, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' };
      case 'PCS': return { label: cats.PCS, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' };
      case 'TEST': return { label: cats.TEST, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
      case 'PACKAGING': return { label: cats.PACKAGING, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      default: return { label: cats.DEFAULT, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    }
  };

  const getHeatmapColor = (utilization: number, isBottleneck: boolean) => {
    if (isBottleneck) {
      return 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white shadow-xs';
    }
    if (utilization >= 90) {
      return 'bg-amber-500/5 border-black/[0.04] dark:border-white/[0.08] text-slate-900 dark:text-white';
    }
    if (utilization >= 75) {
      return 'bg-blue-500/5 border-black/[0.04] dark:border-white/[0.08] text-slate-900 dark:text-white';
    }
    return 'bg-white/60 dark:bg-[#2c2c2e]/60 border-black/[0.04] dark:border-white/[0.06] text-slate-900 dark:text-white';
  };

  return (
    <div className="apple-card p-6 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2 tracking-tight">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{t.title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{t.legendBottleneck}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#007AFF] inline-block"></span>
            <span>{t.legendHigh}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
            <span>{t.legendBalanced}</span>
          </span>
        </div>
      </div>

      {/* Grid of Station Heatmap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {result.stationMetrics.map((st) => {
          const categoryBadge = getCategoryBadge(st.category);
          const heatStyle = getHeatmapColor(st.utilizationRatePercent, st.isBottleneck);

          return (
            <div
              key={st.stationId}
              onClick={() => onSelectStation?.(st.stationId)}
              className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-md ${heatStyle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.5 rounded-full">
                  {st.code}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryBadge.color}`}>
                  {categoryBadge.label}
                </span>
              </div>

              <div className="font-semibold text-xs text-slate-900 dark:text-white truncate mb-2.5">
                {st.name}
              </div>

              {/* Utilization Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500">{t.utilization}</span>
                  <span className={`font-semibold ${
                    st.isBottleneck ? 'text-amber-500' : st.utilizationRatePercent >= 90 ? 'text-[#007AFF]' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {st.utilizationRatePercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.04] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.isBottleneck ? 'bg-amber-500' : st.utilizationRatePercent >= 90 ? 'bg-[#007AFF]' : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                    style={{ width: `${Math.min(100, st.utilizationRatePercent)}%` }}
                  ></div>
                </div>
              </div>

              {/* Station Parameters Footer */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 bg-black/[0.02] dark:bg-white/[0.04] p-2.5 rounded-xl">
                <div>{t.cycleTime}: <b className="text-slate-800 dark:text-slate-200 font-medium">{st.effectiveCycleTimeMin}{t.minutesUnit}</b></div>
                <div>{t.oee}: <b className="text-slate-800 dark:text-slate-200 font-medium">{st.effectiveOEEPercent}%</b></div>
                <div>{t.staff}: <b className="text-slate-800 dark:text-slate-200 font-medium">{st.operatorsTotal}{t.peopleUnit}</b></div>
                <div>{t.capex}: <b className="text-slate-800 dark:text-slate-200 font-medium">￥{st.equipmentCost}{t.wanUnit}</b></div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};


