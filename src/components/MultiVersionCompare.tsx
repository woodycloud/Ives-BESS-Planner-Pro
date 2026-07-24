import React from 'react';
import { 
  Layers, 
  Trash2, 
  Download, 
  Zap, 
  Clock, 
  Gauge, 
  Users, 
  Coins, 
  AlertTriangle
} from 'lucide-react';
import { PlanVersionSnapshot } from '../types/bess';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, translations } from '../utils/i18n';

interface MultiVersionCompareProps {
  snapshots: PlanVersionSnapshot[];
  onDeleteSnapshot: (id: string) => void;
  onRestoreSnapshot: (snapshot: PlanVersionSnapshot) => void;
  onExportCompareCsv: () => void;
  lang?: Language;
}

export const MultiVersionCompare: React.FC<MultiVersionCompareProps> = ({
  snapshots,
  onDeleteSnapshot,
  onRestoreSnapshot,
  onExportCompareCsv,
  lang = 'zh'
}) => {
  const tCompare = translations[lang].compare;

  if (snapshots.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">
          {lang === 'en' ? 'No Saved Scenario Snapshots' : '暂无保存的方案快照'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'en' ? 'Click "Save Version Snapshot" in the main interface or What-if simulator to compare multiple scenarios here.' : '请在主界面或在“What-if 动态模拟”中点击“保存为快照版本”，即可在此处进行多版本横向对比分析。'}
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = snapshots.map((s) => ({
    name: s.versionName,
    gwh: s.result.annualGWhOutput,
    takt: s.result.lineTaktTimeMin,
    balance: s.result.lineBalanceRatioPercent,
    cost: s.result.totalEquipmentCost
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="apple-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2 tracking-tight">
            <Layers className="w-5 h-5 text-[#007AFF]" />
            <span>{lang === 'en' ? 'Version Comparison Matrix' : '多版本产线规划方案对比矩阵'} ({snapshots.length} {lang === 'en' ? 'versions' : '个版本'})</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {lang === 'en' ? 'Side-by-side comparison of capacity, balance rate, cycle time and investment metrics' : '直观对比不同工艺配置、班次制度与自动化水平下的产线产能、平衡率与投资回报率'}
          </p>
        </div>

        <button
          onClick={onExportCompareCsv}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-[#007AFF]" />
          <span>{lang === 'en' ? 'Export CSV Matrix' : '导出对比矩阵 CSV'}</span>
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="apple-card p-6 space-y-3">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{lang === 'en' ? 'Annual Capacity (GWh) & Takt Time (min) Comparison' : '各方案年产能 (GWh) 与 Takt 节拍 (min) 对比图表'}</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" className="dark:stroke-[#2c2c2e]" vertical={false} />
              <XAxis dataKey="name" stroke="#8e8e93" fontSize={11} />
              <YAxis yAxisId="left" stroke="#007AFF" fontSize={11} unit=" GWh" />
              <YAxis yAxisId="right" orientation="right" stroke="#FF3B30" fontSize={11} unit=" min" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="gwh" name={lang === 'en' ? 'Capacity (GWh)' : '年产能 (GWh)'} fill="#007AFF" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="takt" name={lang === 'en' ? 'Takt Time (min)' : 'Takt 节拍 (min)'} fill="#FF3B30" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="apple-card p-0 overflow-x-auto overflow-hidden">
        <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200 min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
            <tr>
              <th className="py-3 px-4 w-48 bg-slate-50 dark:bg-slate-950 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">比较维度 / 指标</th>
              {snapshots.map((s) => (
                <th key={s.id} className="py-3 px-4 min-w-[200px] text-center border-r border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{s.versionName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            
            {/* Annual Capacity GWh */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>年预计产能 (GWh)</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-bold text-teal-600 dark:text-teal-300 font-mono border-r border-slate-100 dark:border-slate-800/60 text-sm">
                  {s.result.annualGWhOutput} GWh
                </td>
              ))}
            </tr>

            {/* Daily Capacity MWh */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                日产能 (MWh / 台数)
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-mono border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.dailyMWhOutput} MWh ({s.result.dailyUnitsOutput} 台/天)
                </td>
              ))}
            </tr>

            {/* Line Takt Time */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>产线 Takt 节拍</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-bold font-mono text-indigo-600 dark:text-indigo-300 border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.lineTaktTimeMin} min/台
                </td>
              ))}
            </tr>

            {/* Line Balance Rate */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>产线平衡率 (%)</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.lineBalanceRatioPercent}%
                </td>
              ))}
            </tr>

            {/* Bottleneck Station */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>瓶颈工站名称</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800/60">
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded mr-1">
                    {s.result.bottleneckStationCode}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{s.result.bottleneckStationName}</span>
                </td>
              ))}
            </tr>

            {/* Shift Model */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                班次与工作日
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/60">
                  {s.lineModel.shiftConfig.shiftsPerDay} 班/天 · {s.lineModel.shiftConfig.operatingDaysPerYear} 天/年
                </td>
              ))}
            </tr>

            {/* Total Headcount */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>总工人数 (操作工)</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-mono border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.totalOperators} 人
                </td>
              ))}
            </tr>

            {/* Total Investment */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>设备投资总额 (万元)</span>
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-mono border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.totalEquipmentCost} 万元
                </td>
              ))}
            </tr>

            {/* Investment per GWh */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                投资效率 (万元/GWh)
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center font-mono text-teal-600 dark:text-teal-300 border-r border-slate-100 dark:border-slate-800/60">
                  {s.result.investmentPerGWh} 万/GWh
                </td>
              ))}
            </tr>

            {/* Action Buttons Row */}
            <tr className="bg-slate-50 dark:bg-slate-950">
              <td className="py-3 px-4 font-bold text-slate-500 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                方案操作
              </td>
              {snapshots.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onRestoreSnapshot(s)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
                    >
                      载入为主方案
                    </button>
                    <button
                      onClick={() => onDeleteSnapshot(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                      title="删除方案"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
