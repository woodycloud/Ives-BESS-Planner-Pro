import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Settings, 
  Clock, 
  Users, 
  ShieldCheck, 
  Cpu, 
  RotateCcw,
  Container,
  Check,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  ProductionLineModel, 
  StationParameter, 
  ProcessCategory, 
  ShiftConfig,
  ContainerSpec 
} from '../types/bess';
import { BESS_CONTAINER_SPECS } from '../utils/defaultPresets';
import { Language, translations } from '../utils/i18n';

interface LineModelingViewProps {
  model: ProductionLineModel;
  onUpdateModel: (updatedModel: ProductionLineModel) => void;
  onResetToDefault: () => void;
  onNavigateToGwhCalc?: () => void;
  lang?: Language;
}

export const LineModelingView: React.FC<LineModelingViewProps> = ({
  model,
  onUpdateModel,
  onResetToDefault,
  onNavigateToGwhCalc,
  lang = 'zh'
}) => {
  const t = translations[lang].modeling;
  const tGeneral = translations[lang];
  const [editingStation, setEditingStation] = useState<StationParameter | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categoryNames: Record<string, string> = lang === 'en' ? {
    PREP: 'Pre-assembly',
    PACK: 'Module Welding',
    CLUSTER: 'Cluster Fastening',
    ELECTRICAL: 'HV Wiring',
    AUXILIARY: 'Liquid & Fire Safety',
    PCS: 'PCS Inverter',
    TEST: 'Testing & Commissioning',
    PACKAGING: 'Packaging & Shipping'
  } : {
    PREP: '集装箱前装',
    PACK: '模组焊接',
    CLUSTER: '电池簇拧紧',
    ELECTRICAL: '高压柜接线',
    AUXILIARY: '液冷消防',
    PCS: 'PCS逆变器',
    TEST: '绝缘充放电测试',
    PACKAGING: '包装发运'
  };

  // Handle station parameter changes
  const handleStationChange = (id: string, field: keyof StationParameter, value: any) => {
    const updatedStations = model.stations.map((st) => {
      if (st.id === id) {
        return { ...st, [field]: value };
      }
      return st;
    });
    onUpdateModel({ ...model, stations: updatedStations });
  };

  // Reorder station
  const handleMoveStation = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= model.stations.length) return;

    const newStations = [...model.stations];
    const temp = newStations[index];
    newStations[index] = newStations[targetIdx];
    newStations[targetIdx] = temp;

    // Auto update code sequences
    newStations.forEach((st, idx) => {
      st.code = `ST-${(idx + 1).toString().padStart(2, '0')}`;
    });

    onUpdateModel({ ...model, stations: newStations });
  };

  // Delete station
  const handleDeleteStation = (id: string) => {
    if (model.stations.length <= 1) {
      alert('产线至少需要保留1个工站');
      return;
    }
    const filtered = model.stations.filter((st) => st.id !== id);
    filtered.forEach((st, idx) => {
      st.code = `ST-${(idx + 1).toString().padStart(2, '0')}`;
    });
    onUpdateModel({ ...model, stations: filtered });
  };

  // Add new station
  const handleAddStation = (newSt: StationParameter) => {
    const nextCode = `ST-${(model.stations.length + 1).toString().padStart(2, '0')}`;
    const stationToAdd = { ...newSt, id: `st-${Date.now()}`, code: nextCode };
    onUpdateModel({ ...model, stations: [...model.stations, stationToAdd] });
    setIsAddModalOpen(false);
  };

  // Update station from modal
  const handleSaveStationDetails = (updatedSt: StationParameter) => {
    const updatedStations = model.stations.map(st => st.id === updatedSt.id ? updatedSt : st);
    onUpdateModel({ ...model, stations: updatedStations });
    setEditingStation(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Macro Parameter Context & Navigation to GWh Calculator */}
      <div className="apple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
            <Cpu className="w-5 h-5 opacity-80" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                {lang === 'en' ? 'Station Engineering Modeling' : '典型工站与工艺参数工程建模'}
              </h3>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                {model.stations.length} {lang === 'en' ? 'Stations' : '个工站'}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap items-center gap-2 font-normal">
              <span>{lang === 'en' ? 'Container Spec:' : '当前产品规格:'} <strong className="font-semibold text-slate-700 dark:text-slate-300">{model.containerSpec.name} ({model.containerSpec.energyCapacityMWh}MWh)</strong></span>
              <span>•</span>
              <span>{lang === 'en' ? 'Target:' : '年产能目标:'} <strong className="font-semibold text-slate-700 dark:text-slate-300">{model.targetAnnualGWh} GWh</strong></span>
              <span>•</span>
              <span>{lang === 'en' ? 'Shift:' : '班制:'} <strong className="font-semibold text-slate-700 dark:text-slate-300">{model.shiftConfig.operatingDaysPerYear}天 ({model.shiftConfig.shiftsPerDay}班倒)</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToGwhCalc && (
            <button
              onClick={onNavigateToGwhCalc}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title={lang === 'en' ? 'Configure macro GWh targets, shifts & product specs' : '前往 GWh 测算器调整目标产能与班制规格'}
            >
              <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>{lang === 'en' ? 'GWh & Shift Config' : '配置宏观产能与班次'}</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1 px-3.5 py-2 text-xs font-medium rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addStation}</span>
          </button>

          <button
            onClick={onResetToDefault}
            title={lang === 'en' ? 'Reset to BESS standard preset' : '恢复为储能集装箱标准预设模板'}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefault}</span>
          </button>
        </div>

      </div>

      {/* STATIONS TABLE */}
      <div className="space-y-4">
        <div className="apple-card overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Process Flow & Parameters (Live Editable)' : '工序流程顺序表与工艺参数（支持全字段在线修改）'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {lang === 'en' ? 'Click input fields to modify values in real-time' : '点击表内各输入框可直接实时修改参数 · 设备投资费用可精准更改'}
            </span>
          </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3 text-center">{lang === 'en' ? 'Seq' : '顺序'}</th>
                    <th className="py-3 px-3">{t.code} / {t.name}</th>
                    <th className="py-3 px-3">{t.category}</th>
                    <th className="py-3 px-3">{t.standardTimeSec}</th>
                    <th className="py-3 px-3 text-center">{t.parallelLanes}</th>
                    <th className="py-3 px-3 text-center">{t.operatorsCount} / {t.machinesCount}</th>
                    <th className="py-3 px-3 text-center">OEE (A/P/Q %)</th>
                    <th className="py-3 px-3 text-center">{t.reworkRate} / {t.avgReworkTimeSec}</th>
                    <th className="py-3 px-3 text-center">{t.equipmentCostTenThousand}</th>
                    <th className="py-3 px-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {model.stations.map((st, index) => (
                    <tr key={st.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition group">
                      
                      {/* Order Controls */}
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveStation(index, 'up')}
                            className="p-1 hover:text-[#007AFF] disabled:opacity-20 text-slate-400 transition"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-[11px] text-slate-500 font-bold">{index + 1}</span>
                          <button
                            disabled={index === model.stations.length - 1}
                            onClick={() => handleMoveStation(index, 'down')}
                            className="p-1 hover:text-[#007AFF] disabled:opacity-20 text-slate-400 transition"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Station Code & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-md border border-[#007AFF]/20">
                            {st.code}
                          </span>
                          <input
                            type="text"
                            value={st.name}
                            onChange={(e) => handleStationChange(st.id, 'name', e.target.value)}
                            className="bg-transparent font-semibold text-slate-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.06] px-1.5 py-0.5 rounded-lg border border-transparent hover:border-black/10 dark:hover:border-white/10 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-[#007AFF] w-44 truncate"
                          />
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <select
                          value={st.category}
                          onChange={(e) => handleStationChange(st.id, 'category', e.target.value as ProcessCategory)}
                          className="bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-[#007AFF]"
                        >
                          {Object.entries(categoryNames).map(([catKey, catLabel]) => (
                            <option key={catKey} value={catKey}>{catLabel}</option>
                          ))}
                        </select>
                      </td>

                      {/* Standard Time Sec */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={st.standardTimeSec}
                            onChange={(e) => handleStationChange(st.id, 'standardTimeSec', Number(e.target.value))}
                            className="w-20 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-[#007AFF] font-mono font-bold px-2 py-1 rounded-lg text-center focus:outline-none focus:border-[#007AFF]"
                          />
                          <span className="text-[10px] text-slate-400">
                            {lang === 'en' ? 's' : '秒'} ({Math.round((st.standardTimeSec/60)*10)/10}{lang === 'en' ? 'm' : '分'})
                          </span>
                        </div>
                      </td>

                      {/* Parallel Lanes */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={st.parallelLanes || 1}
                          onChange={(e) => handleStationChange(st.id, 'parallelLanes', Number(e.target.value))}
                          className="w-14 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-1 rounded-lg text-center focus:outline-none focus:border-[#007AFF]"
                        />
                      </td>

                      {/* Staff & Equipment */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1 font-mono">
                          <input
                            type="number"
                            min={0}
                            value={st.operatorsCount}
                            onChange={(e) => handleStationChange(st.id, 'operatorsCount', Number(e.target.value))}
                            className="w-12 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded-lg text-center"
                            title="每班人"
                          />
                          <span className="text-slate-400 text-[11px]">人 /</span>
                          <input
                            type="number"
                            min={1}
                            value={st.machinesCount}
                            onChange={(e) => handleStationChange(st.id, 'machinesCount', Number(e.target.value))}
                            className="w-12 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded-lg text-center"
                            title="台设备"
                          />
                          <span className="text-slate-400 text-[11px]">台</span>
                        </div>
                      </td>

                      {/* OEE Breakdown */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1 font-mono text-[11px]">
                          <span title="可用率 A">{st.availabilityRate}%</span>
                          <span className="text-slate-400">/</span>
                          <span title="性能率 P">{st.performanceRate}%</span>
                          <span className="text-slate-400">/</span>
                          <span title="合格率 Q" className="text-emerald-600 dark:text-emerald-400 font-semibold">{st.qualityRate}%</span>
                        </div>
                      </td>

                      {/* Rework Impact */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1 font-mono text-[11px]">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={st.reworkRate || 0}
                            onChange={(e) => handleStationChange(st.id, 'reworkRate', Number(e.target.value))}
                            className="w-12 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded-lg text-center"
                          />
                          <span className="text-slate-400">% /</span>
                          <span className="text-slate-500">{st.avgReworkTimeSec}s</span>
                        </div>
                      </td>

                      {/* Equipment Cost (Editable) */}
                      <td className="py-3 px-3 text-center font-mono">
                        <div className="flex items-center justify-center space-x-1">
                          <input
                            type="number"
                            min={0}
                            step={10}
                            value={st.equipmentCostTenThousand || 0}
                            onChange={(e) => handleStationChange(st.id, 'equipmentCostTenThousand', Number(e.target.value))}
                            className="w-16 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] text-[#007AFF] font-bold px-1 py-0.5 rounded-lg text-center focus:outline-none focus:border-[#007AFF]"
                          />
                          <span className="text-slate-400 text-[10px]">万</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setEditingStation(st)}
                            className="p-1.5 text-slate-400 hover:text-[#007AFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-lg transition"
                            title="详细参数编辑"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(st.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-lg transition"
                            title="删除工站"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* ADD STATION MODAL */}
      {isAddModalOpen && (
        <AddStationModal
          lang={lang}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddStation}
        />
      )}

      {/* EDIT STATION FULL PARAMETERS MODAL */}
      {editingStation && (
        <EditStationModal
          lang={lang}
          station={editingStation}
          onClose={() => setEditingStation(null)}
          onSave={handleSaveStationDetails}
        />
      )}

    </div>
  );
};

// Add Station Modal
const AddStationModal: React.FC<{
  lang: 'zh' | 'en';
  onClose: () => void;
  onAdd: (st: StationParameter) => void;
}> = ({ lang, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcessCategory>('TEST');
  const [stdTimeSec, setStdTimeSec] = useState(1800);
  const [parallelLanes, setParallelLanes] = useState(1);
  const [operators, setOperators] = useState(2);
  const [machines, setMachines] = useState(1);
  const [cost, setCost] = useState(100);

  const categoryNames: Record<string, string> = lang === 'en' ? {
    PREP: 'Pre-assembly',
    PACK: 'Module Welding',
    CLUSTER: 'Cluster Fastening',
    ELECTRICAL: 'HV Wiring',
    AUXILIARY: 'Liquid & Fire Safety',
    PCS: 'PCS Inverter',
    TEST: 'Testing & Commissioning',
    PACKAGING: 'Packaging & Shipping'
  } : {
    PREP: '集装箱前装',
    PACK: '模组焊接',
    CLUSTER: '簇级拧紧',
    ELECTRICAL: '高压接线',
    AUXILIARY: '液冷消防',
    PCS: 'PCS逆变器',
    TEST: '测试调试',
    PACKAGING: '包装发运'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      id: '',
      code: '',
      name,
      category,
      automationLevel: 'SEMI_AUTO',
      standardTimeSec: stdTimeSec,
      parallelLanes,
      operatorsCount: operators,
      machinesCount: machines,
      availabilityRate: 95,
      performanceRate: 95,
      qualityRate: 98,
      reworkRate: 1,
      avgReworkTimeSec: 600,
      footprintSqM: 100,
      equipmentCostTenThousand: cost
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
        <h3 className="text-base font-bold">
          {lang === 'en' ? 'Add BESS Line Workstation' : '新增储能集装箱产线典型工站'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              {lang === 'en' ? 'Station Name' : '工站名称'}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'en' ? 'e.g. Dual Charge Test Bench' : '如：双工位充放电测试台'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Process Category' : '工序类型'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProcessCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2"
              >
                {Object.entries(categoryNames).map(([cKey, cLabel]) => (
                  <option key={cKey} value={cKey}>{cLabel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Standard Time (sec)' : '标准工时 (秒)'}
              </label>
              <input
                type="number"
                min={10}
                value={stdTimeSec}
                onChange={(e) => setStdTimeSec(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono text-teal-600 dark:text-teal-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Parallel Lanes' : '并线数'}
              </label>
              <input
                type="number"
                min={1}
                value={parallelLanes}
                onChange={(e) => setParallelLanes(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Operators/Shift' : '每班工人'}
              </label>
              <input
                type="number"
                min={0}
                value={operators}
                onChange={(e) => setOperators(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Cost (10k RMB)' : '设备投资(万)'}
              </label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              {lang === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-500"
            >
              {lang === 'en' ? 'Confirm Add' : '确定新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Station Full Detail Modal
const EditStationModal: React.FC<{
  lang: 'zh' | 'en';
  station: StationParameter;
  onClose: () => void;
  onSave: (st: StationParameter) => void;
}> = ({ lang, station, onClose, onSave }) => {
  const [formData, setFormData] = useState<StationParameter>({ ...station });

  const handleChange = (field: keyof StationParameter, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-teal-500" />
          <span>{lang === 'en' ? `Station [${formData.code}] Parameters Edit` : `工站 [${formData.code}] 参数全维度编辑`}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Station Name' : '工站名称'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Equipment Cost (10k RMB)' : '设备投资金额 (万元 RMB)'}
              </label>
              <input
                type="number"
                min={0}
                value={formData.equipmentCostTenThousand}
                onChange={(e) => handleChange('equipmentCostTenThousand', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono font-bold text-teal-600 dark:text-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Std Time (s)' : '标准工时 (秒)'}
              </label>
              <input
                type="number"
                min={10}
                value={formData.standardTimeSec}
                onChange={(e) => handleChange('standardTimeSec', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono text-teal-600 dark:text-teal-300"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Parallel Lanes' : '并线通道数'}
              </label>
              <input
                type="number"
                min={1}
                value={formData.parallelLanes || 1}
                onChange={(e) => handleChange('parallelLanes', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Footprint (m²)' : '占地面积 (m²)'}
              </label>
              <input
                type="number"
                min={10}
                value={formData.footprintSqM || 100}
                onChange={(e) => handleChange('footprintSqM', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          {/* OEE Three Elements */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'OEE Three Factors (%):' : 'OEE 综合设备效率三要素 (%):'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Availability (A)' : '设备可用率 (A)'}</span>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={formData.availabilityRate}
                  onChange={(e) => handleChange('availabilityRate', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 font-mono text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Performance (P)' : '表现性能率 (P)'}</span>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={formData.performanceRate}
                  onChange={(e) => handleChange('performanceRate', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 font-mono text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Quality (Q)' : '质量合格率 (Q)'}</span>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={formData.qualityRate}
                  onChange={(e) => handleChange('qualityRate', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 font-mono text-center text-emerald-600 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Rework Rate (%)' : '返修概率 (%)'}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.reworkRate || 0}
                onChange={(e) => handleChange('reworkRate', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono text-amber-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Extra Rework Time (s)' : '单次返修额外耗时 (秒)'}
              </label>
              <input
                type="number"
                min={0}
                value={formData.avgReworkTimeSec || 0}
                onChange={(e) => handleChange('avgReworkTimeSec', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              {lang === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-500"
            >
              {lang === 'en' ? 'Save Changes' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
