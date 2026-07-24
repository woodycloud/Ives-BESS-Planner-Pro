import React from 'react';
import { 
  Factory, 
  SlidersHorizontal, 
  BarChart3, 
  FileText, 
  Sun, 
  Moon, 
  Globe, 
  Calculator,
  Layers,
  ChevronDown,
  Command,
  Download,
  Upload,
  DownloadCloud,
  ShieldCheck
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
  onOpenCommandPalette: () => void;
  onOpenGuideModal?: () => void;
  activeTab: 'overview' | 'gwhCalc' | 'modeling' | 'whatif' | 'compare';
  setActiveTab: (tab: 'overview' | 'gwhCalc' | 'modeling' | 'whatif' | 'compare') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  models,
  activeModel,
  onSelectModel,
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
  onOpenReport,
  isWhatIfActive,
  lang,
  onToggleLang,
  onExportJson,
  onImportJson,
  isPwaInstalled,
  onInstallPwa,
  onOpenCommandPalette,
  onOpenGuideModal
}) => {
  const t = translations[lang];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f5f5f7]/80 dark:bg-[#000000]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.08] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row: Strict single-line row */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="w-8 h-8 sm:w-8 sm:h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                    IVES BESS-Planner
                  </h1>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase tracking-wider shrink-0 leading-none">
                    {t.proPwa}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal tracking-tight hidden lg:block mt-0.5 leading-none">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Floating Apple Segmented Control Tabs (Desktop) */}
            <div className="hidden md:flex items-center justify-center shrink-0">
              <div className="bg-black/[0.04] dark:bg-white/[0.08] p-1 rounded-full backdrop-blur-xl flex items-center space-x-0.5 border border-black/[0.02] dark:border-white/[0.05]">
                
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                  <span>{t.tabs.overview}</span>
                </button>

                <button
                  onClick={() => setActiveTab('gwhCalc')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                    activeTab === 'gwhCalc'
                      ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 opacity-70" />
                  <span>{t.tabs.gwhCalc}</span>
                </button>

                <button
                  onClick={() => setActiveTab('modeling')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                    activeTab === 'modeling'
                      ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 opacity-70" />
                  <span>{t.tabs.modeling}</span>
                </button>

                <button
                  onClick={() => setActiveTab('whatif')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                    activeTab === 'whatif' || isWhatIfActive
                      ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
                  <span>{t.tabs.whatif}</span>
                  {isWhatIfActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse"></span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                    activeTab === 'compare'
                      ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span>{t.tabs.compare}</span>
                </button>
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Process Guide Standard Modal Button */}
              {onOpenGuideModal && (
                <button
                  onClick={onOpenGuideModal}
                  title={lang === 'en' ? 'BESS Manufacturing Process & EOL Quality Standard' : '查看 5MWh与6.25MWh 对标、1-2-1 电芯分选与-80kPa气密性工艺规范'}
                  className="hidden md:flex items-center space-x-1 px-2.5 h-8 rounded-full bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/20 text-[11px] font-semibold transition-colors shrink-0 active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'BESS Specs' : '工艺规范'}</span>
                </button>
              )}

              {/* Command Palette Button */}
              <button
                onClick={onOpenCommandPalette}
                title={lang === 'en' ? 'Open Command Palette (Cmd+K)' : '打开快捷指令菜单 (Cmd+K)'}
                className="hidden sm:flex items-center space-x-1 px-2.5 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] border border-black/[0.02] dark:border-white/[0.05] text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                <Command className="w-3 h-3 text-[#007AFF]" />
                <span className="hidden md:inline font-mono text-[10px] bg-black/[0.06] dark:bg-white/[0.1] px-1 rounded">⌘K</span>
              </button>

              {/* Export JSON Project */}
              <button
                onClick={onExportJson}
                title={t.exportJsonTitle}
                className="hidden lg:flex items-center space-x-1 px-2.5 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] border border-black/[0.02] dark:border-white/[0.05] text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                <Download className="w-3 h-3 text-[#007AFF]" />
                <span>JSON</span>
              </button>

              {/* Import JSON Project */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportJson}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title={t.importJsonTitle}
                className="hidden lg:flex items-center space-x-1 px-2.5 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] border border-black/[0.02] dark:border-white/[0.05] text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                <Upload className="w-3 h-3 text-emerald-500" />
              </button>

              {/* Install PWA Button if available */}
              {!isPwaInstalled && (
                <button
                  onClick={onInstallPwa}
                  title={t.installPwaTitle}
                  className="hidden xl:flex items-center space-x-1 px-2.5 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors shrink-0 active:scale-95"
                >
                  <DownloadCloud className="w-3 h-3" />
                  <span>{t.installPwa}</span>
                </button>
              )}

              {/* Preset Selector Dropdown */}
              <div className="relative flex items-center bg-black/[0.04] dark:bg-white/[0.08] px-2 sm:px-2.5 h-8 rounded-full border border-black/[0.02] dark:border-white/[0.05] shrink-0 hover:bg-black/[0.07] dark:hover:bg-white/[0.12] transition-colors">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 mr-1 hidden xs:inline">
                  {t.presetLabel}
                </span>
                <select
                  value={activeModel.id}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="bg-transparent text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[160px] truncate pr-3 appearance-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
              </div>

              {/* Language Switch */}
              <button 
                onClick={onToggleLang}
                title={lang === 'zh' ? 'Switch interface language to English' : '切换界面语言为中文'}
                className="flex items-center space-x-1 px-2 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] border border-black/[0.02] dark:border-white/[0.05] text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                <Globe className="w-3 h-3 opacity-70" />
                <span>{lang === 'zh' ? 'EN' : '中文'}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? t.themeTitleLight : t.themeTitleDark}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 border border-black/[0.02] dark:border-white/[0.05] transition-colors shrink-0 active:scale-95"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
              </button>

              {/* Report Button */}
              <button
                onClick={onOpenReport}
                className="flex items-center space-x-1 px-2.5 sm:px-3 h-8 text-[11px] sm:text-xs font-medium rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-xs transition-all duration-200 active:scale-95 shrink-0"
              >
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{t.reportBtn}</span>
              </button>

            </div>
          </div>

        </div>
      </header>

      {/* Native iOS Mobile Bottom Navigation Bar (Visible only on mobile screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.1] px-1 pt-1.5 pb-safe flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all duration-150 active:scale-90 ${
            activeTab === 'overview'
              ? 'text-[#007AFF] font-semibold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          <BarChart3 className={`w-5 h-5 mb-0.5 ${activeTab === 'overview' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t.tabs.overview}</span>
        </button>

        <button
          onClick={() => setActiveTab('gwhCalc')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all duration-150 active:scale-90 ${
            activeTab === 'gwhCalc'
              ? 'text-[#007AFF] font-semibold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          <Calculator className={`w-5 h-5 mb-0.5 ${activeTab === 'gwhCalc' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t.tabs.gwhCalc}</span>
        </button>

        <button
          onClick={() => setActiveTab('modeling')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all duration-150 active:scale-90 ${
            activeTab === 'modeling'
              ? 'text-[#007AFF] font-semibold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          <Factory className={`w-5 h-5 mb-0.5 ${activeTab === 'modeling' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t.tabs.modeling}</span>
        </button>

        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all duration-150 active:scale-90 relative ${
            activeTab === 'whatif' || isWhatIfActive
              ? 'text-[#007AFF] font-semibold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          <SlidersHorizontal className={`w-5 h-5 mb-0.5 ${activeTab === 'whatif' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t.tabs.whatif}</span>
          {isWhatIfActive && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#007AFF] ring-2 ring-white dark:ring-[#1c1c1e] animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all duration-150 active:scale-90 ${
            activeTab === 'compare'
              ? 'text-[#007AFF] font-semibold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          <Layers className={`w-5 h-5 mb-0.5 ${activeTab === 'compare' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t.tabs.compare}</span>
        </button>

      </nav>
    </>
  );
};



