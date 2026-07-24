import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectBar } from './components/ProjectBar';
import { ProjectMenuModal } from './components/ProjectMenuModal';
import { OverviewKpiCards } from './components/OverviewKpiCards';
import { BottleneckChart } from './components/BottleneckChart';
import { StationHeatmap } from './components/StationHeatmap';
import { LineModelingView } from './components/LineModelingView';
import { GwhCapacityCalculator } from './components/GwhCapacityCalculator';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MultiVersionCompare } from './components/MultiVersionCompare';
import { SimulationReportModal } from './components/SimulationReportModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { BessProcessGuideModal } from './components/BessProcessGuideModal';

import { ProjectProvider, useProject } from './context/ProjectContext';
import { ProductionLineModel, PlanVersionSnapshot, CapacityCalculationResult } from './types/bess';
import { calculateLineCapacity } from './utils/capacityCalculator';
import { DEFAULT_LINE_MODELS } from './utils/defaultPresets';
import { Language } from './utils/i18n';

function ToastNotification() {
  const { toast } = useProject();
  if (!toast) return null;

  return (
    <div className="fixed top-12 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-4 pointer-events-none">
      <div className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center space-x-3 text-xs font-semibold ${
        toast.type === 'error'
          ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
          : 'bg-slate-900/90 dark:bg-slate-900/95 border-[#007AFF]/40 text-white shadow-blue-950/50 ring-1 ring-[#007AFF]/30'
      }`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function WorkspaceInner() {
  const { 
    project, 
    allProjects, 
    updateLineModel, 
    saveCurrentProject, 
    addVersionSnapshot, 
    deleteVersionSnapshotById,
    exportProjectJson
  } = useProject();

  // Active line model is bound directly to the unified project object
  const activeModel = project.lineModel;

  // Language state: default to 'zh', support 'en'
  const [lang, setLang] = useState<Language>('zh');

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // Theme state: default to dark mode for industrial feel, or light mode
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Apply dark class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // UI Tab & Modal Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'gwhCalc' | 'modeling' | 'whatif' | 'compare'>('overview');
  const [isWhatIfActive, setIsWhatIfActive] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Project Manager Modal State
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [projectMenuInitialTab, setProjectMenuInitialTab] = useState<'new' | 'open' | 'saveAs'>('open');

  const handleOpenProjectMenu = (tab: 'new' | 'open' | 'saveAs' = 'open') => {
    setProjectMenuInitialTab(tab);
    setIsProjectMenuOpen(true);
  };

  // PWA Install prompt state
  const [pwaDeferredPrompt, setPwaDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, Ctrl+S, Ctrl+O, Ctrl+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleOpenProjectMenu('saveAs');
        } else {
          saveCurrentProject();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenProjectMenu('open');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenProjectMenu('new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentProject]);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('ServiceWorker registered:', reg.scope),
        (err) => console.warn('ServiceWorker registration failed:', err)
      );
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setPwaDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Compute baseline capacity calculation result directly from single source of truth
  const baselineResult = useMemo(() => {
    return calculateLineCapacity(activeModel);
  }, [activeModel]);

  // Reset active model to preset default
  const handleResetToDefault = () => {
    const preset = DEFAULT_LINE_MODELS.find(p => p.id === activeModel.id) || DEFAULT_LINE_MODELS[0];
    updateLineModel({ ...preset, id: activeModel.id });
  };

  // Apply What-if simulated model as baseline
  const handleApplyScenarioToModel = (simulatedModel: ProductionLineModel) => {
    updateLineModel(simulatedModel);
    setIsWhatIfActive(false);
    setActiveTab('overview');
  };

  // Save version snapshot for side-by-side comparison
  const handleSaveAsVersionSnapshot = async (
    versionName: string, 
    simulatedModel: ProductionLineModel, 
    result: CapacityCalculationResult
  ) => {
    await addVersionSnapshot(
      versionName, 
      `Target: ${simulatedModel.targetAnnualGWh} GWh | Shifts: ${simulatedModel.shiftConfig.shiftsPerDay}`
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Station Code', 'Station Name', 'Category', 'Cycle Time (min)', 'Utilization (%)', 'OEE (%)', 'FPY (%)', 'Capex (10k RMB)'];
    const rows = baselineResult.stationMetrics.map(st => [
      st.code,
      st.name,
      st.category,
      st.effectiveCycleTimeMin,
      st.utilizationRatePercent,
      st.effectiveOEEPercent,
      st.passRate,
      st.equipmentCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.meta.code}_${activeModel.name}_capacity_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger PWA Installation
  const handleInstallPwa = async () => {
    if (pwaDeferredPrompt) {
      pwaDeferredPrompt.prompt();
      const choiceResult = await pwaDeferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setPwaDeferredPrompt(null);
    } else {
      alert('Click the "Install App" icon in your browser address bar to install this applet as an offline PWA.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-teal-500 selection:text-white">
      
      <ToastNotification />

      {/* Top Project Manager Bar & Auto-Save Status */}
      <ProjectBar 
        onOpenProjectMenu={handleOpenProjectMenu}
        lang={lang}
      />

      {/* Top Navbar Header */}
      <Navbar
        models={DEFAULT_LINE_MODELS}
        activeModel={activeModel}
        onSelectModel={(id) => {
          const tmpl = DEFAULT_LINE_MODELS.find(m => m.id === id);
          if (tmpl) updateLineModel(tmpl);
        }}
        onSaveModel={saveCurrentProject}
        onOpenVersions={() => setActiveTab('compare')}
        onToggleWhatIf={() => {
          setIsWhatIfActive(!isWhatIfActive);
          if (!isWhatIfActive) setActiveTab('whatif');
        }}
        isWhatIfActive={isWhatIfActive}
        onOpenReport={() => setIsReportOpen(true)}
        onExportJson={exportProjectJson}
        onImportJson={() => handleOpenProjectMenu('open')}
        isPwaInstalled={isPwaInstalled}
        onInstallPwa={handleInstallPwa}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 pt-4 pb-24 md:py-6 space-y-6">
        
        {/* KPI Cards Banner */}
        <OverviewKpiCards
          result={baselineResult}
          model={activeModel}
          isWhatIfActive={isWhatIfActive}
          baselineResult={baselineResult}
          lang={lang}
          onNavigateToGwhCalc={() => setActiveTab('gwhCalc')}
        />

        {/* Tab 1: Overview & Heatmap */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <BottleneckChart
              result={baselineResult}
              lang={lang}
              onStationSelect={() => {
                setActiveTab('modeling');
              }}
            />

            <StationHeatmap
              result={baselineResult}
              lang={lang}
              onSelectStation={() => {
                setActiveTab('modeling');
              }}
            />
          </div>
        )}

        {/* Tab 2: Dedicated GWh Capacity Calculator */}
        {activeTab === 'gwhCalc' && (
          <GwhCapacityCalculator
            model={activeModel}
            result={baselineResult}
            onUpdateModel={updateLineModel}
            lang={lang}
          />
        )}

        {/* Tab 3: Station Line Modeling */}
        {activeTab === 'modeling' && (
          <LineModelingView
            model={activeModel}
            onUpdateModel={updateLineModel}
            onResetToDefault={handleResetToDefault}
            onNavigateToGwhCalc={() => setActiveTab('gwhCalc')}
            lang={lang}
          />
        )}

        {/* Tab 4: What-if Scenario Simulator */}
        {activeTab === 'whatif' && (
          <WhatIfSimulator
            baseModel={activeModel}
            baseResult={baselineResult}
            onApplyScenarioToModel={handleApplyScenarioToModel}
            onSaveAsVersionSnapshot={handleSaveAsVersionSnapshot}
            lang={lang}
          />
        )}

        {/* Tab 5: Multi-Version Comparison Matrix */}
        {activeTab === 'compare' && (
          <MultiVersionCompare
            snapshots={project.versions}
            onDeleteSnapshot={deleteVersionSnapshotById}
            onRestoreSnapshot={(s) => {
              updateLineModel(s.lineModel);
              setActiveTab('overview');
            }}
            onExportCompareCsv={handleExportCsv}
            lang={lang}
          />
        )}

      </main>

      {/* Engineering Project Management Modal (New / Open / Save As / Recent / Recover) */}
      <ProjectMenuModal
        isOpen={isProjectMenuOpen}
        onClose={() => setIsProjectMenuOpen(false)}
        initialTab={projectMenuInitialTab}
        lang={lang}
      />

      {/* Command Palette Modal (Cmd + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        models={DEFAULT_LINE_MODELS}
        activeModel={activeModel}
        onSelectModel={(id) => {
          const tmpl = DEFAULT_LINE_MODELS.find(m => m.id === id);
          if (tmpl) updateLineModel(tmpl);
        }}
        onSaveModel={saveCurrentProject}
        onOpenReport={() => setIsReportOpen(true)}
        onExportJson={exportProjectJson}
        onImportJsonClick={() => handleOpenProjectMenu('open')}
        onOpenProjectMenu={handleOpenProjectMenu}
        theme={theme}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Dynamic Print / PDF Report Modal */}
      <SimulationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        model={activeModel}
        result={baselineResult}
        onExportCsv={handleExportCsv}
        lang={lang}
      />

      {/* BESS Process & Quality Control Standard Modal */}
      <BessProcessGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 py-4 mb-14 md:mb-0 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium">
            IVES BESS-Planner Pro · Project Architecture v2.0 ({project.meta.code})
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Unified Single Source State · Debounced Auto-Save · Project Manager
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <WorkspaceInner />
    </ProjectProvider>
  );
}
