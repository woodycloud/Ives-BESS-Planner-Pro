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
  lang?: Language;
}

export const LineModelingView: React.FC<LineModelingViewProps> = ({
  model,
  onUpdateModel,
  onResetToDefault,
  lang = 'zh'
}) => {
  const t = translations[lang].modeling;
  const tGeneral = translations[lang];
  const [editingStation, setEditingStation] = useState<StationParameter | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSpecModalOpen, setIsAddSpecModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stations' | 'shift' | 'container'>('stations');

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

  // Shift config changes
  const handleShiftChange = (field: keyof ShiftConfig, value: number) => {
    onUpdateModel({
      ...model,
      shiftConfig: { ...model.shiftConfig, [field]: value }
    });
  };

  // Container spec select
  const handleContainerSpecChange = (specKey: string) => {
    const spec = BESS_CONTAINER_SPECS[specKey];
    if (spec) {
      onUpdateModel({ ...model, containerSpec: spec });
    }
  };

  // Edit current active container spec
  const handleUpdateActiveContainerSpec = (field: keyof ContainerSpec, value: any) => {
    onUpdateModel({
      ...model,
      containerSpec: {
        ...model.containerSpec,
        [field]: value
      }
    });
  };

  // Add custom spec
  const handleAddCustomSpec = (newSpec: ContainerSpec) => {
    onUpdateModel({
      ...model,
      containerSpec: newSpec
    });
    setIsAddSpecModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-4 border border-white/80 dark:border-slate-800/80 shadow-xs">
        
        <div className="flex items-center space-x-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeTab === 'stations' 
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{lang === 'en' ? 'Station Modeling' : '典型工站建模'} ({model.stations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shift')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeTab === 'shift' 
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{lang === 'en' ? 'Shifts & Days Config' : '班次与工作日配置'}</span>
          </button>

          <button
            onClick={() => setActiveTab('container')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeTab === 'container' 
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Container className="w-4 h-4" />
            <span>{lang === 'en' ? 'Container Specifications' : '集装箱产品规格'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'stations' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addStation}</span>
            </button>
          )}

          <button
            onClick={onResetToDefault}
            title={lang === 'en' ? 'Reset to BESS standard preset' : '恢复为储能集装箱标准预设模板'}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefault}</span>
          </button>
        </div>

      </div>

      {/* TAB 1: STATIONS LIST */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                {lang === 'en' ? 'Process Flow & Parameters (Live Editable)' : '工序流程顺序表与工艺参数（支持全字段在线修改）'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
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
                    <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
                      
                      {/* Order Controls */}
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveStation(index, 'up')}
                            className="p-1 hover:text-teal-500 disabled:opacity-20 text-slate-400 transition"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-[11px] text-slate-500 font-bold">{index + 1}</span>
                          <button
                            disabled={index === model.stations.length - 1}
                            onClick={() => handleMoveStation(index, 'down')}
                            className="p-1 hover:text-teal-500 disabled:opacity-20 text-slate-400 transition"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Station Code & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                            {st.code}
                          </span>
                          <input
                            type="text"
                            value={st.name}
                            onChange={(e) => handleStationChange(st.id, 'name', e.target.value)}
                            className="bg-transparent font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-teal-500 w-44 truncate"
                          />
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <select
                          value={st.category}
                          onChange={(e) => handleStationChange(st.id, 'category', e.target.value as ProcessCategory)}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-teal-500"
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
                            className="w-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-300 font-mono font-bold px-2 py-1 rounded text-center focus:outline-none focus:border-teal-500"
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
                          className="w-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-1 rounded text-center focus:outline-none focus:border-teal-500"
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
                            className="w-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded text-center"
                            title="每班人"
                          />
                          <span className="text-slate-400">人 /</span>
                          <input
                            type="number"
                            min={1}
                            value={st.machinesCount}
                            onChange={(e) => handleStationChange(st.id, 'machinesCount', Number(e.target.value))}
                            className="w-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded text-center"
                            title="台设备"
                          />
                          <span className="text-slate-400">台</span>
                        </div>
                      </td>

                      {/* OEE Breakdown */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1 font-mono text-[11px]">
                          <span title="可用率 A">{st.availabilityRate}%</span>
                          <span className="text-slate-400">/</span>
                          <span title="性能率 P">{st.performanceRate}%</span>
                          <span className="text-slate-400">/</span>
                          <span title="合格率 Q" className="text-emerald-600 dark:text-emerald-400 font-bold">{st.qualityRate}%</span>
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
                            className="w-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-300 px-1 py-0.5 rounded text-center"
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
                            className="w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 font-bold px-1 py-0.5 rounded text-center focus:outline-none focus:border-teal-500"
                          />
                          <span className="text-slate-400 text-[10px]">万</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setEditingStation(st)}
                            className="p-1 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                            title="详细参数编辑"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(st.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
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
      )}

      {/* TAB 2: SHIFT CONFIGURATION */}
      {activeTab === 'shift' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-500" />
            <span>{lang === 'en' ? 'Shift Patterns & Operating Working Days Settings' : '班次制度与生产工作日设置'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Daily Shift Pattern (Shifts/Day)' : '每日排班模式 (Shifts/Day)'}
              </label>
              <select
                value={model.shiftConfig.shiftsPerDay}
                onChange={(e) => handleShiftChange('shiftsPerDay', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-teal-600 dark:text-teal-300 focus:outline-none focus:border-teal-500"
              >
                <option value={1}>{lang === 'en' ? 'Single Shift (1 Shift/Day - 8h)' : '单班制 (1 班/天 - 常规 8小时)'}</option>
                <option value={2}>{lang === 'en' ? 'Double Shift (2 Shifts/Day - 10h each)' : '双班制 (2 班/天 - 早晚班各10小时)'}</option>
                <option value={3}>{lang === 'en' ? 'Triple Shift (3 Shifts/Day - 24h Continuous)' : '三班倒 (3 班/天 - 24小时连续生产)'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.shiftHours}
              </label>
              <input
                type="number"
                min={4}
                max={12}
                value={model.shiftConfig.hoursPerShift}
                onChange={(e) => handleShiftChange('hoursPerShift', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.shiftBreakMin}
              </label>
              <input
                type="number"
                min={0}
                max={180}
                value={model.shiftConfig.plannedDowntimeMinPerShift}
                onChange={(e) => handleShiftChange('plannedDowntimeMinPerShift', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.operatingDays}
              </label>
              <input
                type="number"
                min={100}
                max={365}
                value={model.shiftConfig.operatingDaysPerYear}
                onChange={(e) => handleShiftChange('operatingDaysPerYear', Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-teal-500"
              />
            </div>

          </div>

          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 rounded-xl text-xs text-teal-800 dark:text-teal-200 space-y-1">
            <div className="font-bold text-teal-900 dark:text-teal-100">
              {lang === 'en' ? 'Production Time Calculation Summary:' : '生产时间计算摘要:'}
            </div>
            <div>• {lang === 'en' ? 'Net effective time per shift:' : '每班净有效生产时长:'} <b>{model.shiftConfig.hoursPerShift * 60 - model.shiftConfig.plannedDowntimeMinPerShift} {lang === 'en' ? 'mins' : '分钟'}</b></div>
            <div>• {lang === 'en' ? 'Daily total net working time:' : '每日总净工作时长:'} <b>{(model.shiftConfig.hoursPerShift * 60 - model.shiftConfig.plannedDowntimeMinPerShift) * model.shiftConfig.shiftsPerDay} {lang === 'en' ? 'mins' : '分钟'} ({Math.round(((model.shiftConfig.hoursPerShift * 60 - model.shiftConfig.plannedDowntimeMinPerShift) * model.shiftConfig.shiftsPerDay / 60)*10)/10} {lang === 'en' ? 'hours' : '小时'})</b></div>
            <div>• {lang === 'en' ? 'Annual total working hours:' : '年工作总时长:'} <b>{Math.round((model.shiftConfig.hoursPerShift * 60 - model.shiftConfig.plannedDowntimeMinPerShift) * model.shiftConfig.shiftsPerDay * model.shiftConfig.operatingDaysPerYear / 60)} {lang === 'en' ? 'hours/yr' : '小时/年'}</b></div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTAINER SPECIFICATION */}
      {activeTab === 'container' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Container className="w-5 h-5 text-teal-500" />
                <span>{lang === 'en' ? 'BESS Container Spec & Electrochemical Parameters Management' : '储能集装箱 (BESS Unit) 产品规格与电化学参数管理'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'en' ? 'Select preset models below or customize physical and battery system parameters' : '支持直接在下方修改当前选中集装箱产品规格的所有物理与系统参数，或添加全新型号'}
              </p>
            </div>

            <button
              onClick={() => setIsAddSpecModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Add Container Spec' : '添加新集装箱规格'}</span>
            </button>
          </div>

          {/* Preset Spec Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Select preset or custom container model:' : '快速选择预设或自定义规格型号:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(BESS_CONTAINER_SPECS).map(([key, spec]) => (
                <div
                  key={spec.id}
                  onClick={() => handleContainerSpecChange(key)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    model.containerSpec.name === spec.name
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-100 shadow-sm ring-2 ring-teal-400/20'
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">{spec.name}</div>
                  <div className="text-xl font-bold font-mono text-teal-600 dark:text-teal-300">{spec.energyCapacityMWh} MWh</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                    <div>{lang === 'en' ? 'Voltage:' : '电压等级:'} {spec.voltageLevelV}V</div>
                    <div>{lang === 'en' ? 'PACK Count:' : '包含 PACK 数:'} {spec.packCount} {lang === 'en' ? 'packs' : '包'}</div>
                    <div>{lang === 'en' ? 'Cluster Count:' : '电池簇数:'} {spec.clusterCount} {lang === 'en' ? 'clusters' : '簇'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Container Spec Live Editor Panel */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              {lang === 'en' ? 'Active Container Specification Live Editor:' : '当前生效集装箱规格详细参数实时编辑:'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'Model Name' : '规格型号名称'}
                </label>
                <input
                  type="text"
                  value={model.containerSpec.name}
                  onChange={(e) => handleUpdateActiveContainerSpec('name', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'Energy Capacity (MWh)' : '单箱能量容量 (MWh)'}
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={model.containerSpec.energyCapacityMWh}
                  onChange={(e) => handleUpdateActiveContainerSpec('energyCapacityMWh', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono font-bold text-teal-600 dark:text-teal-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'DC Voltage Level (V)' : '直流电压等级 (V)'}
                </label>
                <input
                  type="number"
                  value={model.containerSpec.voltageLevelV}
                  onChange={(e) => handleUpdateActiveContainerSpec('voltageLevelV', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'Built-in PACK Count (Packs)' : '内置 PACK 模组数量 (包)'}
                </label>
                <input
                  type="number"
                  value={model.containerSpec.packCount}
                  onChange={(e) => handleUpdateActiveContainerSpec('packCount', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'Built-in Cluster Count (Clusters)' : '内置电池簇数量 (簇)'}
                </label>
                <input
                  type="number"
                  value={model.containerSpec.clusterCount}
                  onChange={(e) => handleUpdateActiveContainerSpec('clusterCount', Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {lang === 'en' ? 'Dimensions (e.g. 20ft / 40ft)' : '尺寸规格 (如 20尺/40尺)'}
                </label>
                <input
                  type="text"
                  value={model.containerSpec.dimensions || '20尺标准高柜'}
                  onChange={(e) => handleUpdateActiveContainerSpec('dimensions', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* ADD CONTAINER SPEC MODAL */}
      {isAddSpecModalOpen && (
        <AddContainerSpecModal
          lang={lang}
          onClose={() => setIsAddSpecModalOpen(false)}
          onAdd={handleAddCustomSpec}
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

// Add Container Spec Modal
const AddContainerSpecModal: React.FC<{
  lang: 'zh' | 'en';
  onClose: () => void;
  onAdd: (spec: ContainerSpec) => void;
}> = ({ lang, onClose, onAdd }) => {
  const [name, setName] = useState(lang === 'en' ? 'IVES-6.0MWh HV BESS Container' : 'IVES-6.0MWh 特高压储能集装箱');
  const [energy, setEnergy] = useState(6.0);
  const [voltage, setVoltage] = useState(1500);
  const [pack, setPack] = useState(288);
  const [cluster, setCluster] = useState(24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `spec-${Date.now()}`,
      name,
      energyCapacityMWh: energy,
      voltageLevelV: voltage,
      packCount: pack,
      clusterCount: cluster,
      dimensions: lang === 'en' ? '20ft High Density Container' : '20尺特高密集装箱'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
        <h3 className="text-base font-bold">
          {lang === 'en' ? 'Add Container Specification' : '新增集装箱产品规格说明'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              {lang === 'en' ? 'Spec Name' : '规格名称'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Total Energy (MWh)' : '标称总能量 (MWh)'}
              </label>
              <input
                type="number"
                step={0.1}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono font-bold text-teal-600 dark:text-teal-300"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'DC Voltage Level (V)' : '直流电压等级 (V)'}
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'PACK Count (Packs)' : '包含 PACK 数 (包)'}
              </label>
              <input
                type="number"
                value={pack}
                onChange={(e) => setPack(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                {lang === 'en' ? 'Cluster Count (Clusters)' : '电池簇数量 (簇)'}
              </label>
              <input
                type="number"
                value={cluster}
                onChange={(e) => setCluster(Number(e.target.value))}
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
              {lang === 'en' ? 'Confirm Add' : '确定添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
