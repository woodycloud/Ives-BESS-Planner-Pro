import React from 'react';
import { 
  X, 
  Printer, 
  AlertTriangle, 
  Factory,
  FileSpreadsheet
} from 'lucide-react';
import { CapacityCalculationResult, ProductionLineModel } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface SimulationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ProductionLineModel;
  result: CapacityCalculationResult;
  onExportCsv: () => void;
  lang?: Language;
}

export const SimulationReportModal: React.FC<SimulationReportModalProps> = ({
  isOpen,
  onClose,
  model,
  result,
  onExportCsv,
  lang = 'zh'
}) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header (Screen only) */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-[#007AFF]" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {isEn ? 'IVES BESS-Planner Pro Simulation Diagnostic Report' : 'IVES BESS-Planner Pro 储能产线仿真诊断报告'}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExportCsv}
              className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEn ? 'Export CSV' : '导出 CSV 表格'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-xs transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / PDF Report' : '打印 / 保存 PDF 报告'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-white dark:bg-slate-900 print:bg-white print:text-slate-900 text-slate-900 dark:text-slate-100 print:p-0 print:m-0">
          
          {/* Report Cover / Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 pb-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-extrabold text-teal-600 dark:text-teal-400 print:text-teal-800 uppercase tracking-widest">
                  IVES BESS-PLANNER PRO · {isEn ? 'SIMULATION REPORT' : '产线仿真诊断报告'}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 print:text-slate-900 tracking-tight mt-1">
                  {model.name} {isEn ? 'Simulation Diagnostic Evaluation' : '仿真评估评估报告'}
                </h1>
                <p className="text-xs text-slate-500 print:text-slate-600 mt-1 font-mono">
                  {isEn ? 'Version' : '版本'}: {model.version} · {isEn ? 'Date' : '生成日期'}: {new Date().toLocaleString()} · {isEn ? 'Container Spec' : '集装箱规格'}: {model.containerSpec.name}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 print:text-slate-600 hidden sm:block font-mono">
                <div>{isEn ? 'Target Capacity' : '目标产能'}: <b>{model.targetAnnualGWh} GWh/{isEn ? 'yr' : '年'}</b></div>
                <div>{isEn ? 'Target Takt' : '目标节拍'}: <b>{result.demandTaktTimeMin} {isEn ? 'min/unit' : '分钟/台'}</b></div>
              </div>
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] print:bg-slate-50 print:border-slate-200">
              <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">{isEn ? 'Est. Annual Output' : '预估年产能'}</div>
              <div className="text-xl font-bold text-[#007AFF] font-mono mt-1">
                {result.annualGWhOutput} GWh
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {isEn ? 'Target Met' : '目标达成率'}: {result.capacityTargetMetPercent}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
              <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">{isEn ? 'Daily Energy Output' : '日均能量产出'}</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 print:text-slate-900 font-mono mt-1">
                {result.dailyMWhOutput} MWh
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {isEn ? 'Daily Units' : '日产台数'}: {result.dailyUnitsOutput} {isEn ? 'units/day' : '台/天'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
              <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">{isEn ? 'Line Takt Time' : '瓶颈产线节拍'}</div>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 print:text-indigo-800 font-mono mt-1">
                {result.lineTaktTimeMin} {isEn ? 'min' : '分钟'}
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {isEn ? 'Target Takt' : '目标节拍'}: {result.demandTaktTimeMin} {isEn ? 'min' : '分钟'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
              <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">{isEn ? 'Line Balance Rate' : '产线平衡率'}</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-mono mt-1">
                {result.lineBalanceRatioPercent}%
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {isEn ? 'Balance Loss' : '平衡损失'}: {result.balanceLossPercent}%
              </div>
            </div>
          </div>

          {/* Bottleneck Diagnostic Section */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 print:bg-amber-50 print:border-amber-200 space-y-2">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 print:text-amber-900 uppercase flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'Bottleneck & Diagnostic Summary' : '瓶颈工站与仿真结论摘要'}</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 leading-relaxed">
              {isEn ? (
                <>
                  According to capacity simulation, the current line bottleneck is at <b>[{result.bottleneckStationCode}] {result.bottleneckStationName}</b> with an effective cycle time of <b>{result.bottleneckCycleTimeMin} min</b>.
                  Line FPY is <b>{result.lineFPYPercent}%</b> and average OEE is <b>{result.averageOEEPercent}%</b>.
                  Total operators: <b>{result.totalOperators} headcount</b>, equipment capex: <b>￥{result.totalEquipmentCost}k RMB</b> (Capex per GWh: <b>￥{result.investmentPerGWh}k RMB/GWh</b>).
                </>
              ) : (
                <>
                  根据产线仿真计算，当前产线速度瓶颈工站在于 <b>[{result.bottleneckStationCode}] {result.bottleneckStationName}</b>，其有效工站周期为 <b>{result.bottleneckCycleTimeMin} 分钟</b>。
                  产线综合直通率 (FPY) 为 <b>{result.lineFPYPercent}%</b>，平均设备 OEE 为 <b>{result.averageOEEPercent}%</b>。
                  整条产线定员总计 <b>{result.totalOperators} 人</b>，设备投资总额 <b>￥{result.totalEquipmentCost} 万元</b> (单位产能投资: <b>￥{result.investmentPerGWh} 万元/GWh</b>)。
                </>
              )}
            </p>
          </div>

          {/* Detailed Workstation Parameter Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-slate-900 uppercase">
              {isEn ? 'Workstation Details & Capacity Breakdown' : '工站明细与产能计算'}
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 print:border-slate-300 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300 print:text-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950 print:bg-slate-100 text-slate-500 dark:text-slate-400 print:text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="py-2 px-3">{isEn ? 'Code' : '工站编号'}</th>
                    <th className="py-2 px-3">{isEn ? 'Station Name' : '工站名称'}</th>
                    <th className="py-2 px-3">{isEn ? 'Cycle Time' : '工站周期'}</th>
                    <th className="py-2 px-3 text-center">{isEn ? 'Utilization' : '负荷利用率'}</th>
                    <th className="py-2 px-3 text-center">{isEn ? 'OEE' : '综合 OEE'}</th>
                    <th className="py-2 px-3 text-center">{isEn ? 'FPY (%)' : '直通率 (%)'}</th>
                    <th className="py-2 px-3 text-center">{isEn ? 'Operators/Eq' : '每班定员/设备'}</th>
                    <th className="py-2 px-3 text-right">{isEn ? 'Capex (10k RMB)' : '设备投资 (万元)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                  {result.stationMetrics.map((st) => (
                    <tr key={st.stationId} className={st.isBottleneck ? 'bg-amber-50/60 dark:bg-amber-950/20 print:bg-rose-50 font-semibold' : ''}>
                      <td className="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400 print:text-teal-800">{st.code}</td>
                      <td className="py-2 px-3">
                        {st.name}
                        {st.isBottleneck && <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 print:text-rose-700">[{isEn ? 'Bottleneck' : '瓶颈工站'}]</span>}
                      </td>
                      <td className="py-2 px-3 font-mono">{st.effectiveCycleTimeMin} {isEn ? 'min' : '分钟'}</td>
                      <td className="py-2 px-3 text-center font-mono">{st.utilizationRatePercent}%</td>
                      <td className="py-2 px-3 text-center font-mono">{st.effectiveOEEPercent}%</td>
                      <td className="py-2 px-3 text-center font-mono">{st.passRate}%</td>
                      <td className="py-2 px-3 text-center font-mono">{st.operatorsTotal/model.shiftConfig.shiftsPerDay} {isEn ? 'p' : '人'} / {st.equipmentCost > 0 ? (isEn ? '1 unit' : '1 台') : '0'}</td>
                      <td className="py-2 px-3 text-right font-mono">￥{st.equipmentCost}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off Block */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 grid grid-cols-3 gap-4 text-[11px] text-slate-500 print:text-slate-600">
            <div>{isEn ? 'Planner Lead: IVES BESS Team' : '规划负责人: IVES BESS Team'}</div>
            <div>{isEn ? 'Reviewed By: _________________' : '审核人: _________________'}</div>
            <div>{isEn ? 'Approved By: _________________' : '批准人: _________________'}</div>
          </div>

        </div>

      </div>
    </div>
  );
};

