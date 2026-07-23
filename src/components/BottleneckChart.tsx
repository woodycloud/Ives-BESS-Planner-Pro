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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-50 text-slate-900 dark:text-slate-100">
          <div className="flex items-center space-x-2 font-bold">
            <span className="font-mono text-teal-600 dark:text-teal-400">[{d.code}]</span>
            <span>{d.name}</span>
            {d.isBottleneck && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-orange-950 dark:text-orange-300 border border-amber-300 dark:border-orange-800 font-normal">
                ★ {t.bottleneckLegend}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
            <div>{t.cycleTimeLabel}: <b className="text-teal-600 dark:text-teal-300">{d.cycleTime} min</b></div>
            <div>{t.utilizationLabel}: <b className={d.utilization >= 90 ? 'text-amber-600 dark:text-orange-400' : 'text-teal-600 dark:text-teal-400'}>{d.utilization}%</b></div>
            <div>{t.oeeLabel}: <b className="text-slate-800 dark:text-slate-200">{d.oee}%</b></div>
            <div>{t.capexLabel}: <b className="text-slate-800 dark:text-slate-200">￥{d.equipmentCost}万</b></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800/80 shadow-xs space-y-4">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-4 bg-teal-500 rounded-full"></span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
              {t.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {t.currentTakt}: <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{result.lineTaktTimeMin} min/unit</span> | {t.demandTakt}: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{result.demandTaktTimeMin} min/unit</span>
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-50 dark:bg-slate-800 rounded-lg text-[10px] text-amber-700 dark:text-orange-400 font-mono border border-amber-200 dark:border-orange-800/80 font-bold">
            ★ {t.bottleneckLegend}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-amber-600 dark:text-amber-400 font-mono border border-slate-200 dark:border-slate-700">
            {t.highLoadLegend}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-teal-600 dark:text-teal-400 font-mono border border-slate-200 dark:border-slate-700">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
            <XAxis 
              dataKey="code" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              unit=" min"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference Line for Demand Takt Time */}
            {result.demandTaktTimeMin > 0 && (
              <ReferenceLine
                y={result.demandTaktTimeMin}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `${t.demandTaktLine}: ${result.demandTaktTimeMin} min`,
                  fill: '#6366f1',
                  fontSize: 11,
                  position: 'top'
                }}
              />
            )}

            {/* Reference Line for Actual Line Takt Time */}
            <ReferenceLine
              y={result.lineTaktTimeMin}
              stroke="#f97316"
              strokeWidth={2}
              label={{
                value: `${t.bottleneckTaktLine}: ${result.lineTaktTimeMin} min`,
                fill: '#f97316',
                fontSize: 11,
                position: 'insideTopRight'
              }}
            />

            <Bar dataKey="cycleTime" radius={[6, 6, 0, 0]} cursor="pointer">
              {data.map((entry, index) => {
                let fill = '#0d9488'; // Teal default
                if (entry.isBottleneck) {
                  fill = '#ea580c'; // Orange for bottleneck
                } else if (entry.utilization >= 85) {
                  fill = '#d97706'; // Amber for high load
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottleneck Diagnostic Banner */}
      {bottleneck && (
        <div className="bg-amber-50 dark:bg-orange-950/20 border border-amber-200 dark:border-orange-800/80 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-slate-800 dark:text-orange-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900 dark:text-orange-100 flex items-center space-x-2">
              <span>{t.primaryBottleneck}: [{bottleneck.code}] {bottleneck.name}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
              {t.bottleneckCt}: <b className="font-mono text-amber-700 dark:text-orange-300">{bottleneck.effectiveCycleTimeMin} min</b> ({t.loadFactor})。
              {t.recommendations}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

