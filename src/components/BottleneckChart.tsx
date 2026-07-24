import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CapacityCalculationResult } from '../types/bess';
import { AlertTriangle } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface BottleneckChartProps {
  result: CapacityCalculationResult;
  onStationSelect?: (stationId: string) => void;
  lang?: Language;
}

export const BottleneckChart: React.FC<BottleneckChartProps> = ({
  result,
  onStationSelect,
  lang = 'zh'
}) => {
  const t = translations[lang].chart;

  const data = result.stationMetrics.map((st) => ({
    id: st.stationId,
    code: st.code,
    name: st.name,
    cycleTime: st.effectiveCycleTimeMin,
    utilization: st.utilizationRatePercent,
    isBottleneck: st.isBottleneck,
    oee: st.effectiveOEEPercent,
    operators: st.operatorsTotal,
    equipmentCost: st.equipmentCost
  }));

  const bottleneck = result.stationMetrics.find(s => s.isBottleneck);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.1] p-3.5 rounded-2xl shadow-lg text-xs space-y-1.5 z-50 text-slate-900 dark:text-slate-100">
          <div className="flex items-center space-x-2 font-semibold">
            <span className="font-mono text-[#007AFF]">[{d.code}]</span>
            <span>{d.name}</span>
            {d.isBottleneck && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                ★ {t.bottleneckLegend}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px]">
            <div>{t.cycleTimeLabel}: <b className="text-slate-900 dark:text-white font-medium">{d.cycleTime} min</b></div>
            <div>{t.utilizationLabel}: <b className={d.utilization >= 90 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}>{d.utilization}%</b></div>
            <div>{t.oeeLabel}: <b className="text-slate-900 dark:text-white font-medium">{d.oee}%</b></div>
            <div>{t.capexLabel}: <b className="text-slate-900 dark:text-white font-medium">￥{d.equipmentCost}万</b></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="apple-card p-6 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4 bg-[#007AFF] rounded-full"></span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
              {t.title}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-normal">
              {t.currentTakt}: <span className="text-slate-700 dark:text-slate-300 font-medium">{result.lineTaktTimeMin} min/unit</span> | {t.demandTakt}: <span className="text-indigo-500 font-medium">{result.demandTaktTimeMin} min/unit</span>
            </p>
          </div>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-500/10 rounded-full text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            ★ {t.bottleneckLegend}
          </span>
          <span className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.06] rounded-full text-[10px] text-slate-600 dark:text-slate-300 font-medium">
            {t.highLoadLegend}
          </span>
          <span className="px-2.5 py-1 bg-blue-500/10 rounded-full text-[10px] text-[#007AFF] font-medium">
            {t.normalLegend}
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                onStationSelect?.(state.activePayload[0].payload.id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" className="dark:stroke-[#2c2c2e]" vertical={false} />
            <XAxis 
              dataKey="code" 
              stroke="#8e8e93" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#8e8e93" 
              fontSize={11} 
              unit=" min"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference Line for Demand Takt Time */}
            {result.demandTaktTimeMin > 0 && (
              <ReferenceLine
                y={result.demandTaktTimeMin}
                stroke="#5E5CE6"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${t.demandTaktLine}: ${result.demandTaktTimeMin} min`,
                  fill: '#5E5CE6',
                  fontSize: 11,
                  position: 'top'
                }}
              />
            )}

            {/* Reference Line for Actual Line Takt Time */}
            <ReferenceLine
              y={result.lineTaktTimeMin}
              stroke="#FF9500"
              strokeWidth={1.5}
              label={{
                value: `${t.bottleneckTaktLine}: ${result.lineTaktTimeMin} min`,
                fill: '#FF9500',
                fontSize: 11,
                position: 'insideTopRight'
              }}
            />

            <Bar dataKey="cycleTime" radius={[8, 8, 0, 0]} cursor="pointer">
              {data.map((entry, index) => {
                let fill = '#007AFF'; // Apple System Blue
                if (entry.isBottleneck) {
                  fill = '#FF9500'; // Apple System Orange for bottleneck
                } else if (entry.utilization >= 85) {
                  fill = '#30B0C7'; // Refined Teal for high load
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottleneck Diagnostic Banner */}
      {bottleneck && (
        <div className="bg-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-800 dark:text-slate-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{t.primaryBottleneck}: [{bottleneck.code}] {bottleneck.name}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-normal">
              {t.bottleneckCt}: <b className="font-medium text-slate-800 dark:text-slate-200">{bottleneck.effectiveCycleTimeMin} min</b> ({t.loadFactor})。
              {t.recommendations}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};


