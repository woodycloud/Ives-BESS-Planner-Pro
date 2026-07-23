import React, { useState } from 'react';
import { 
  Boxes, 
  Move, 
  RotateCw, 
  Maximize2, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Ruler, 
  Grid, 
  Layers, 
  Check, 
  Info,
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ProductionLineModel, StationParameter, ProcessCategory, CapacityCalculationResult } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface EquipmentLegoLayoutProps {
  model: ProductionLineModel;
  result: CapacityCalculationResult;
  onUpdateModel: (updatedModel: ProductionLineModel) => void;
  theme?: 'dark' | 'light';
  lang?: Language;
}

export interface LegoBlockPos {
  stationId: string;
  gridX: number; // 0 to 11
  gridY: number; // 0 to 7
  gridW: number; // 1 to 3
  gridH: number; // 1 to 2
}

// Lego Color mapping for process categories
const LEGO_CATEGORY_COLORS: Record<ProcessCategory, { bg: string; border: string; stud: string; text: string; name: string }> = {
  PREP: {
    bg: 'bg-blue-600 dark:bg-blue-600',
    border: 'border-blue-400 dark:border-blue-400',
    stud: 'bg-blue-400 dark:bg-blue-400',
    text: 'text-white',
    name: '箱体前装乐高块'
  },
  PACK: {
    bg: 'bg-red-600 dark:bg-red-600',
    border: 'border-red-400 dark:border-red-400',
    stud: 'bg-red-400 dark:bg-red-400',
    text: 'text-white',
    name: '模组焊接乐高块'
  },
  CLUSTER: {
    bg: 'bg-amber-500 dark:bg-amber-500',
    border: 'border-amber-300 dark:border-amber-300',
    stud: 'bg-amber-300 dark:bg-amber-300',
    text: 'text-slate-900',
    name: '电池簇拧紧乐高块'
  },
  ELECTRICAL: {
    bg: 'bg-emerald-600 dark:bg-emerald-600',
    border: 'border-emerald-400 dark:border-emerald-400',
    stud: 'bg-emerald-400 dark:bg-emerald-400',
    text: 'text-white',
    name: '高压电气乐高块'
  },
  AUXILIARY: {
    bg: 'bg-orange-500 dark:bg-orange-500',
    border: 'border-orange-300 dark:border-orange-300',
    stud: 'bg-orange-300 dark:bg-orange-300',
    text: 'text-white',
    name: '液冷消防乐高块'
  },
  PCS: {
    bg: 'bg-purple-600 dark:bg-purple-600',
    border: 'border-purple-400 dark:border-purple-400',
    stud: 'bg-purple-400 dark:bg-purple-400',
    text: 'text-white',
    name: 'PCS逆变乐高块'
  },
  TEST: {
    bg: 'bg-teal-500 dark:bg-teal-500',
    border: 'border-teal-300 dark:border-teal-300',
    stud: 'bg-teal-300 dark:bg-teal-300',
    text: 'text-slate-900',
    name: '充放电测试乐高块'
  },
  PACKAGING: {
    bg: 'bg-indigo-600 dark:bg-indigo-600',
    border: 'border-indigo-400 dark:border-indigo-400',
    stud: 'bg-indigo-400 dark:bg-indigo-400',
    text: 'text-white',
    name: '包装发运乐高块'
  }
};

export const EquipmentLegoLayout: React.FC<EquipmentLegoLayoutProps> = ({
  model,
  result,
  onUpdateModel,
  theme = 'dark',
  lang = 'zh'
}) => {
  const tLego = translations[lang].lego;
  const GRID_COLS = 12;
  const GRID_ROWS = 8;

  // Layout Positions State
  const [positions, setPositions] = useState<LegoBlockPos[]>(() => {
    return generateDefaultLayoutPositions(model.stations, 'linear');
  });

  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    model.stations[0]?.id || null
  );

  const [layoutTopology, setLayoutTopology] = useState<'linear' | 'ushape' | 'sshape' | 'parallel'>('linear');
  const [showStuds, setShowStuds] = useState(true);

  // Helper to generate default layout topologies
  function generateDefaultLayoutPositions(
    stations: StationParameter[], 
    topology: 'linear' | 'ushape' | 'sshape' | 'parallel'
  ): LegoBlockPos[] {
    return stations.map((st, index) => {
      let x = 0;
      let y = 0;
      let w = st.parallelLanes > 1 ? 2 : 1;
      let h = 1;

      if (topology === 'linear') {
        x = (index * 1) % GRID_COLS;
        y = Math.floor((index * 1) / GRID_COLS) * 2 + 2;
      } else if (topology === 'ushape') {
        const half = Math.ceil(stations.length / 2);
        if (index < half) {
          x = index * 2;
          y = 1;
        } else {
          x = (stations.length - 1 - index) * 2;
          y = 5;
        }
      } else if (topology === 'sshape') {
        const rowItems = 4;
        const row = Math.floor(index / rowItems);
        const col = index % rowItems;
        x = (row % 2 === 0) ? col * 3 : (rowItems - 1 - col) * 3;
        y = row * 2 + 1;
      } else {
        // Parallel Twin
        x = Math.floor(index / 2) * 2;
        y = (index % 2) * 3 + 1;
      }

      return {
        stationId: st.id,
        gridX: Math.min(x, GRID_COLS - w),
        gridY: Math.min(y, GRID_ROWS - h),
        gridW: w,
        gridH: h
      };
    });
  }

  // Handle preset layout change
  const handleApplyPresetTopology = (type: 'linear' | 'ushape' | 'sshape' | 'parallel') => {
    setLayoutTopology(type);
    setPositions(generateDefaultLayoutPositions(model.stations, type));
  };

  // Move a lego block
  const handleMoveBlock = (stationId: string, dx: number, dy: number) => {
    setPositions(prev => prev.map(p => {
      if (p.stationId === stationId) {
        const newX = Math.max(0, Math.min(GRID_COLS - p.gridW, p.gridX + dx));
        const newY = Math.max(0, Math.min(GRID_ROWS - p.gridH, p.gridY + dy));
        return { ...p, gridX: newX, gridY: newY };
      }
      return p;
    }));
  };

  // Resize lego block
  const handleResizeBlock = (stationId: string, dw: number, dh: number) => {
    setPositions(prev => prev.map(p => {
      if (p.stationId === stationId) {
        const newW = Math.max(1, Math.min(4, p.gridW + dw));
        const newH = Math.max(1, Math.min(3, p.gridH + dh));
        return { 
          ...p, 
          gridW: newW, 
          gridH: newH,
          gridX: Math.min(p.gridX, GRID_COLS - newW),
          gridY: Math.min(p.gridY, GRID_ROWS - newH)
        };
      }
      return p;
    }));
  };

  // Selected station object
  const selectedStation = model.stations.find(s => s.id === selectedStationId);
  const selectedPos = positions.find(p => p.stationId === selectedStationId);

  // Total footprint sum
  const totalFootprint = model.stations.reduce((acc, st) => acc + (st.footprintSqM || 100), 0);
  const totalEquipCost = model.stations.reduce((acc, st) => acc + (st.equipmentCostTenThousand || 0), 0);

  // Bottleneck station code
  const bottleneckCode = result.bottleneckStationCode;

  return (
    <div className="space-y-6">
      
      {/* Header Controls & Topology Presets */}
      <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {lang === 'en' ? 'Lego Modular Equipment Layout & Workshop Planning' : '乐高积木式产线设备布局与车间空间规划'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 border border-teal-300 dark:border-teal-800">
                  Lego Layout 2D
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'en' ? 'Build modular BESS assembly lines with Lego blocks, adjusting spatial footprint and flow' : '以模块化乐高积木搭建储能集装箱装配设备，直观调整工站物理布局、物流流向与车间面积占用'}
              </p>
            </div>
          </div>
        </div>

        {/* Preset Topology Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => handleApplyPresetTopology('linear')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutTopology === 'linear'
                ? 'bg-white dark:bg-teal-950 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200 dark:border-teal-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tLego.linear}
          </button>
          <button
            onClick={() => handleApplyPresetTopology('ushape')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutTopology === 'ushape'
                ? 'bg-white dark:bg-teal-950 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200 dark:border-teal-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tLego.ushape}
          </button>
          <button
            onClick={() => handleApplyPresetTopology('sshape')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutTopology === 'sshape'
                ? 'bg-white dark:bg-teal-950 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200 dark:border-teal-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tLego.sshape}
          </button>
          <button
            onClick={() => handleApplyPresetTopology('parallel')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutTopology === 'parallel'
                ? 'bg-white dark:bg-teal-950 text-teal-600 dark:text-teal-300 shadow-sm border border-slate-200 dark:border-teal-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tLego.parallel}
          </button>
        </div>

      </div>

      {/* Main Layout Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEGO Interactive Canvas (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
                <Grid className="w-4 h-4 text-teal-500" />
                <span>乐高网格车间 (12m × 8m 模块单元网格)</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStuds}
                    onChange={(e) => setShowStuds(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>显示乐高颗粒 (Studs)</span>
                </label>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>瓶颈工站: <b className="text-orange-500">{bottleneckCode}</b></span>
              </div>
            </div>

            {/* The 2D Lego Canvas Grid */}
            <div className="relative w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 overflow-x-auto select-none">
              <div 
                className="grid gap-2 min-w-[720px] relative"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(54px, 1fr))`
                }}
              >
                {/* Empty Grid Cells Background with subtle Lego studs */}
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-slate-200/60 dark:border-slate-800/80 rounded-lg flex items-center justify-center relative group"
                  >
                    {showStuds && (
                      <div className="w-2 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 shadow-inner"></div>
                    )}
                  </div>
                ))}

                {/* Lego Equipment Bricks overlay */}
                {model.stations.map((st, index) => {
                  const pos = positions.find(p => p.stationId === st.id) || {
                    stationId: st.id,
                    gridX: (index % GRID_COLS),
                    gridY: Math.floor(index / GRID_COLS),
                    gridW: 1,
                    gridH: 1
                  };

                  const isSelected = selectedStationId === st.id;
                  const isBottleneck = st.code === bottleneckCode;
                  const styleColor = LEGO_CATEGORY_COLORS[st.category] || LEGO_CATEGORY_COLORS.PREP;

                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      style={{
                        gridColumnStart: pos.gridX + 1,
                        gridColumnEnd: `span ${pos.gridW}`,
                        gridRowStart: pos.gridY + 1,
                        gridRowEnd: `span ${pos.gridH}`
                      }}
                      className={`relative cursor-pointer rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 p-2 flex flex-col justify-between shadow-md border-2 select-none ${
                        styleColor.bg
                      } ${
                        isSelected 
                          ? 'ring-4 ring-teal-400 dark:ring-teal-400 z-30 scale-[1.02]' 
                          : 'z-10'
                      } ${
                        isBottleneck 
                          ? 'border-yellow-300 dark:border-yellow-400 animate-pulse' 
                          : styleColor.border
                      }`}
                    >
                      {/* Top Lego Studs Row */}
                      {showStuds && (
                        <div className="flex items-center justify-around w-full mb-1">
                          {Array.from({ length: pos.gridW * 2 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-2.5 h-2.5 rounded-full ${styleColor.stud} shadow-sm border border-black/10`}
                            ></div>
                          ))}
                        </div>
                      )}

                      {/* Station Lego Content */}
                      <div className={`space-y-0.5 ${styleColor.text}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-black/20 tracking-wider">
                            {st.code}
                          </span>
                          {isBottleneck && (
                            <span className="px-1 py-0.5 rounded bg-yellow-400 text-black font-extrabold text-[9px] shadow">
                              {lang === 'en' ? 'Bottleneck' : '瓶颈'}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs truncate leading-tight mt-1">
                          {st.name}
                        </div>
                        <div className="text-[10px] opacity-90 font-mono flex items-center justify-between pt-0.5">
                          <span>{st.footprintSqM || 100}m²</span>
                          <span>{st.parallelLanes > 1 ? (lang === 'en' ? `${st.parallelLanes} lanes` : `${st.parallelLanes}并线`) : (lang === 'en' ? 'Single' : '单线')}</span>
                        </div>
                      </div>

                      {/* Direction Sequence Arrow Indicator */}
                      <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-[9px] text-slate-700 dark:text-slate-200 shadow z-20">
                        #{index + 1}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Category Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{lang === 'en' ? 'Process Block Color Legend:' : '工艺乐高块色彩标注:'}</span>
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(LEGO_CATEGORY_COLORS).map(([cat, cfg]) => (
                  <div key={cat} className="flex items-center space-x-1.5">
                    <span className={`w-3 h-3 rounded ${cfg.bg} shadow-sm`}></span>
                    <span>{cfg.name.replace('乐高块', '').replace(' Block', '')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Selected Lego Equipment Inspector & Controls (1 col) */}
        <div className="space-y-4">
          
          {selectedStation && selectedPos ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    {selectedStation.code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                    {selectedStation.name}
                  </h3>
                </div>
                {selectedStation.code === bottleneckCode && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 text-[10px] font-bold border border-orange-300 dark:border-orange-800">
                    {lang === 'en' ? '★ Bottleneck' : '★ 瓶颈工站'}
                  </span>
                )}
              </div>

              {/* Grid Position & Size Adjusters */}
              <div className="space-y-3 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{lang === 'en' ? 'Move Block:' : '乐高块位置移动:'}</span>
                  <span className="font-mono text-slate-500">
                    X:{selectedPos.gridX}, Y:{selectedPos.gridY}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div></div>
                  <button
                    onClick={() => handleMoveBlock(selectedStation.id, 0, -1)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
                  >
                    {lang === 'en' ? '↑ Up' : '↑ 上移'}
                  </button>
                  <div></div>
                  <button
                    onClick={() => handleMoveBlock(selectedStation.id, -1, 0)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
                  >
                    {lang === 'en' ? '← Left' : '← 左移'}
                  </button>
                  <button
                    onClick={() => handleMoveBlock(selectedStation.id, 0, 1)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
                  >
                    {lang === 'en' ? '↓ Down' : '↓ 下移'}
                  </button>
                  <button
                    onClick={() => handleMoveBlock(selectedStation.id, 1, 0)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
                  >
                    {lang === 'en' ? 'Right →' : '右移 →'}
                  </button>
                </div>

                <div className="font-semibold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>{lang === 'en' ? 'Block Dimensions:' : '乐高块规格尺寸:'}</span>
                  <span className="font-mono text-slate-500">
                    {selectedPos.gridW} × {selectedPos.gridH} {lang === 'en' ? 'cells' : '格'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResizeBlock(selectedStation.id, -1, 0)}
                    className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold"
                  >
                    {lang === 'en' ? '- Width' : '- 变宽'}
                  </button>
                  <button
                    onClick={() => handleResizeBlock(selectedStation.id, 1, 0)}
                    className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold"
                  >
                    {lang === 'en' ? '+ Width' : '+ 变宽'}
                  </button>
                </div>
              </div>

              {/* Station Parameters Summary */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{lang === 'en' ? 'Footprint:' : '占地面积:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedStation.footprintSqM || 100} m²
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{lang === 'en' ? 'Equipment Capex:' : '设备投资:'}</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {selectedStation.equipmentCostTenThousand} {lang === 'en' ? '10k RMB' : '万元'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{lang === 'en' ? 'Operators:' : '操作人员:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedStation.operatorsCount} {lang === 'en' ? 'heads/shift' : '人/班'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{lang === 'en' ? 'Parallel Lanes:' : '并线通道:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedStation.parallelLanes} {lang === 'en' ? 'lanes' : '线'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
              {lang === 'en' ? 'Click any Lego equipment block on the grid to inspect & adjust position' : '请在左侧网格中点击任意乐高设备块以进行位置调整'}
            </div>
          )}

          {/* Overall Layout Metrics Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <Ruler className="w-4 h-4 text-teal-500" />
              <span>{lang === 'en' ? 'Workshop Space & Capex Planning' : '整线车间空间与资金规划'}</span>
            </h4>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'en' ? 'Total Footprint:' : '产线总占地:'}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{totalFootprint} m²</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'en' ? 'Total Equipment Capex:' : '设备总投资:'}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{totalEquipCost} {lang === 'en' ? '10k RMB' : '万元'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'en' ? 'Capex Density:' : '投资密度:'}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {Math.round((totalEquipCost / (totalFootprint || 1)) * 10) / 10} {lang === 'en' ? '10k RMB/m²' : '万元/m²'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
