import React from 'react';
import { 
  Factory, 
  Layers, 
  SlidersHorizontal, 
  BarChart3, 
  FileText, 
  Save, 
  Download, 
  Upload, 
  DownloadCloud,
  Boxes,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { ProductionLineModel } from '../types/bess';
import { Language, translations } from '../utils/i18n';

interface NavbarProps {
  models: ProductionLineModel[];
  activeModel: ProductionLineModel;
  onSelectModel: (id: string) => void;
  onSaveModel: () => void;
  onOpenVersions: () => void;
  onToggleWhatIf: () => void;
  isWhatIfActive: boolean;
  onOpenReport: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPwaInstalled: boolean;
  onInstallPwa: () => void;
  activeTab: 'overview' | 'modeling' | 'layout' | 'whatif' | 'compare';
  setActiveTab: (tab: 'overview' | 'modeling' | 'layout' | 'whatif' | 'compare') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  models,
  activeModel,
  onSelectModel,
  onSaveModel,
  onExportJson,
  onImportJson,
  isPwaInstalled,
  onInstallPwa,
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
  onOpenReport,
  isWhatIfActive,
  lang,
  onToggleLang
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-[#e6eae4]/85 dark:bg-[#121715]/85 backdrop-blur-2xl border-b border-white/60 dark:border-slate-800/60 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between py-3 gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 via-orange-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <svg className="w-5 h-5 fill-current animate-spin-slow" viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  IVES BESS-Planner
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase tracking-wider shrink-0 leading-none">
                  {t.proPwa}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden sm:block mt-1 leading-none">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Floating Pill Center Sub-Navigation Tabs */}
          <div className="order-3 lg:order-2 w-full lg:w-auto flex justify-center py-1">
            <div className="bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-full border border-white/60 dark:border-slate-700/60 backdrop-blur-md flex items-center space-x-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
                <span>{t.tabs.overview}</span>
              </button>

              <button
                onClick={() => setActiveTab('modeling')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'modeling'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Factory className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t.tabs.modeling}</span>
              </button>

              <button
                onClick={() => setActiveTab('layout')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'layout'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.tabs.layout}</span>
              </button>

              <button
                onClick={() => setActiveTab('whatif')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'whatif' || isWhatIfActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.tabs.whatif}</span>
                {isWhatIfActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'compare'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.tabs.compare}</span>
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="order-2 lg:order-3 flex items-center space-x-2 shrink-0">
            
            {/* Preset Selector & Quick Chips */}
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-800/70 px-3.5 h-9 rounded-full border border-white/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                {t.presetLabel}
              </span>
              <select
                value={activeModel.id}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs font-bold text-teal-700 dark:text-teal-300 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate h-full leading-normal"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switch Module (English / 中文) */}
            <div 
              onClick={onToggleLang}
              title={lang === 'zh' ? 'Switch interface language to English' : '切换界面语言为中文'}
              className="flex items-center p-1 h-9 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-white/80 dark:border-slate-700/80 cursor-pointer shadow-2xs transition shrink-0 select-none"
            >
              <Globe className="w-3.5 h-3.5 text-orange-500 mx-1.5" />
              <div className="flex items-center space-x-0.5 text-[11px]">
                <span className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  lang === 'zh' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                  中文
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  lang === 'en' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                  English
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? t.themeTitleLight : t.themeTitleDark}
              className="flex items-center justify-center w-9 h-9 text-xs font-semibold rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white/80 dark:border-slate-700/80 transition shrink-0 shadow-2xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Report Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-4 h-9 text-xs font-bold rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm transition shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.reportBtn}</span>
            </button>

          </div>
        </div>

        {/* Quick Presets Sub-Bar */}
        <div className="pb-2.5 pt-1 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 no-scrollbar w-full">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              {lang === 'en' ? 'Quick Product Presets:' : '快速预设产品:'}
            </span>
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectModel(m.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition whitespace-nowrap shrink-0 border ${
                  activeModel.id === m.id
                    ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </header>
  );
};


