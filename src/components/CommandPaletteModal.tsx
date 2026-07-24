import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Command, 
  X, 
  BarChart3, 
  Calculator, 
  Factory, 
  SlidersHorizontal, 
  Layers, 
  FileText, 
  Download, 
  Upload, 
  Save, 
  Sun, 
  Moon, 
  Globe, 
  Zap, 
  HardDrive
} from 'lucide-react';
import { ProductionLineModel } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'overview' | 'gwhCalc' | 'modeling' | 'whatif' | 'compare';
  setActiveTab: (tab: 'overview' | 'gwhCalc' | 'modeling' | 'whatif' | 'compare') => void;
  models: ProductionLineModel[];
  activeModel: ProductionLineModel;
  onSelectModel: (id: string) => void;
  onSaveModel: () => void;
  onOpenReport: () => void;
  onExportJson: () => void;
  onImportJsonClick: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  models,
  activeModel,
  onSelectModel,
  onSaveModel,
  onOpenReport,
  onExportJson,
  onImportJsonClick,
  theme,
  onToggleTheme,
  lang,
  onToggleLang
}) => {
  const [query, setQuery] = useState('');
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const commandItems = [
    {
      id: 'nav-overview',
      category: lang === 'en' ? 'Navigation' : '页面导航',
      title: t.tabs.overview,
      subtitle: lang === 'en' ? 'View bottleneck chart, heatmap & KPI overview' : '查看瓶颈诊断图表、工站负荷热力图与核心 KPI',
      icon: BarChart3,
      shortcut: '1',
      action: () => setActiveTab('overview')
    },
    {
      id: 'nav-gwh',
      category: lang === 'en' ? 'Navigation' : '页面导航',
      title: t.tabs.gwhCalc,
      subtitle: lang === 'en' ? 'Calculate target GWh, shifts, and required takt time' : '依据目标 GWh、班次与运营天数快速反算所需 Takt 节拍',
      icon: Calculator,
      shortcut: '2',
      action: () => setActiveTab('gwhCalc')
    },
    {
      id: 'nav-modeling',
      category: lang === 'en' ? 'Navigation' : '页面导航',
      title: t.tabs.modeling,
      subtitle: lang === 'en' ? 'Edit station parameters, CT, OEE, staff & Capex' : '调整工站顺序、标准工时、并行通道、OEE 衰减与设备投资',
      icon: Factory,
      shortcut: '3',
      action: () => setActiveTab('modeling')
    },
    {
      id: 'nav-whatif',
      category: lang === 'en' ? 'Navigation' : '页面导航',
      title: t.tabs.whatif,
      subtitle: lang === 'en' ? 'Agile simulation for shift patterns, OEE & lean cycle compression' : '敏捷仿真班次体制、瓶颈并行线扩容与精益工时压缩',
      icon: SlidersHorizontal,
      shortcut: '4',
      action: () => setActiveTab('whatif')
    },
    {
      id: 'nav-compare',
      category: lang === 'en' ? 'Navigation' : '页面导航',
      title: t.tabs.compare,
      subtitle: lang === 'en' ? 'Side-by-side version comparison matrix' : '多版本规划方案横向指标对标',
      icon: Layers,
      shortcut: '5',
      action: () => setActiveTab('compare')
    },

    // Actions & Tools
    {
      id: 'act-report',
      category: lang === 'en' ? 'Report & Export' : '报告与数据工程',
      title: t.reportBtn,
      subtitle: lang === 'en' ? 'Generate PDF/CSV simulation report' : '导出 IVES BESS-Planner Pro 仿真诊断专业报告',
      icon: FileText,
      shortcut: 'P',
      action: onOpenReport
    },
    {
      id: 'act-export-json',
      category: lang === 'en' ? 'Report & Export' : '报告与数据工程',
      title: t.exportJsonTitle,
      subtitle: lang === 'en' ? 'Download .json project configuration file' : '导出包含全部工站参数的工程配置文件',
      icon: Download,
      shortcut: 'E',
      action: onExportJson
    },
    {
      id: 'act-import-json',
      category: lang === 'en' ? 'Report & Export' : '报告与数据工程',
      title: t.importJsonTitle,
      subtitle: lang === 'en' ? 'Upload and restore .json project configuration file' : '读取并导入外部 JSON 产线规划工程文件',
      icon: Upload,
      shortcut: 'I',
      action: onImportJsonClick
    },
    {
      id: 'act-save-idb',
      category: lang === 'en' ? 'Data Persistence' : '本地持久化',
      title: lang === 'en' ? 'Save Workspace to IndexedDB' : '保存当前工作区至 IndexedDB 本地数据库',
      subtitle: lang === 'en' ? 'Persist model changes for offline PWA usage' : '持久化存入浏览器离线数据库，离线随时访问',
      icon: Save,
      shortcut: 'S',
      action: onSaveModel
    },

    // System Preferences
    {
      id: 'sys-theme',
      category: lang === 'en' ? 'Preferences' : '偏好设置',
      title: theme === 'dark' ? t.themeTitleLight : t.themeTitleDark,
      subtitle: lang === 'en' ? 'Switch visual theme mode' : '切换界面色彩模式 (暗黑工业风 / 高清白盘)',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: 'T',
      action: onToggleTheme
    },
    {
      id: 'sys-lang',
      category: lang === 'en' ? 'Preferences' : '偏好设置',
      title: lang === 'zh' ? 'Switch to English UI' : '切换为中文界面',
      subtitle: lang === 'en' ? 'Toggle UI language between Chinese and English' : '中英双语工程术语一键无缝切换',
      icon: Globe,
      shortcut: 'L',
      action: onToggleLang
    }
  ];

  const filteredItems = commandItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity">
      
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] transition-transform scale-100">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder={lang === 'en' ? 'Type a command or search...' : '快速搜索指令、切换页面、导出工程配置 (Cmd+K)...'}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Selector Banner inside Command Palette */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>{t.presetLabel}</span>
          </span>
          <select
            value={activeModel.id}
            onChange={(e) => {
              onSelectModel(e.target.value);
              onClose();
            }}
            className="bg-white dark:bg-[#2c2c2e] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Command Items List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
              {lang === 'en' ? 'No matching commands found' : '未找到匹配的命令或工站项'}
            </div>
          ) : (
            filteredItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.action)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition text-left group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 group-hover:bg-[#007AFF] group-hover:text-white transition-colors shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.shortcut && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-black/[0.06] dark:bg-white/[0.1] text-slate-600 dark:text-slate-300 shrink-0">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.1] text-slate-600 dark:text-slate-300 font-mono text-[10px]">ESC</span>
            <span>{lang === 'en' ? 'Close' : '关闭快捷指令'}</span>
          </div>
          <div className="flex items-center space-x-1 text-[#007AFF]">
            <Zap className="w-3 h-3" />
            <span>IVES BESS-Planner Pro</span>
          </div>
        </div>

      </div>
    </div>
  );
};
