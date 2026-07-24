import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
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

import { ProductionLineModel, PlanVersionSnapshot, CapacityCalculationResult } from './types/bess';
import { calculateLineCapacity } from './utils/capacityCalculator';
import { DEFAULT_LINE_MODELS } from './utils/defaultPresets';
import { Language } from './utils/i18n';
import { 
  initStorage, 
  saveModel, 
  getAllVersionSnapshots, 
  saveVersionSnapshot, 
  deleteVersionSnapshot 
} from './utils/indexedDB';

export default function App() {
  const [models, setModels] = useState<ProductionLineModel[]>(DEFAULT_LINE_MODELS);
  const [activeModelId, setActiveModelId] = useState<string>(DEFAULT_LINE_MODELS[0].id);
  const [versionSnapshots, setVersionSnapshots] = useState<PlanVersionSnapshot[]>([]);
  
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

  // PWA Install prompt state
  const [pwaDeferredPrompt, setPwaDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize IndexedDB storage and load versions
  useEffect(() => {
    async function loadData() {
      const storedModels = await initStorage();
      setModels(storedModels);
      if (storedModels.length > 0) {
        setActiveModelId(storedModels[0].id);
      }

      const snapshots = await getAllVersionSnapshots();
      setVersionSnapshots(snapshots);
    }

    loadData();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('ServiceWorker registered:', reg.scope),
        (err) => console.warn('ServiceWorker registration failed:', err)
      );
    }

    // Capture PWA install prompt
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

  // Get active line model
  const activeModel = useMemo(() => {
    return models.find(m => m.id === activeModelId) || models[0];
  }, [models, activeModelId]);

  // Compute baseline capacity calculation result
  const baselineResult = useMemo(() => {
    return calculateLineCapacity(activeModel);
  }, [activeModel]);

  // Save current active model to IndexedDB
  const handleSaveModel = async () => {
    await saveModel(activeModel);
    alert(`Model "${activeModel.name}" successfully saved to IndexedDB storage.`);
  };

  // Update active model from editor
  const handleUpdateModel = async (updatedModel: ProductionLineModel) => {
    setModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
    await saveModel(updatedModel);
  };

  // Reset active model to preset default
  const handleResetToDefault = () => {
    const preset = DEFAULT_LINE_MODELS.find(p => p.id === activeModel.id) || DEFAULT_LINE_MODELS[0];
    handleUpdateModel({ ...preset, id: activeModel.id });
  };

  // Apply What-if simulated model as baseline
  const handleApplyScenarioToModel = (simulatedModel: ProductionLineModel) => {
    handleUpdateModel(simulatedModel);
    setIsWhatIfActive(false);
    setActiveTab('overview');
  };

  // Save version snapshot for side-by-side comparison
  const handleSaveAsVersionSnapshot = async (
    versionName: string, 
    simulatedModel: ProductionLineModel, 
    result: CapacityCalculationResult
  ) => {
    const snapshot: PlanVersionSnapshot = {
      id: `ver-${Date.now()}`,
      versionName,
      createdAt: new Date().toISOString(),
      notes: `Target: ${simulatedModel.targetAnnualGWh} GWh | Shifts: ${simulatedModel.shiftConfig.shiftsPerDay}`,
      lineModel: simulatedModel,
      result
    };

    await saveVersionSnapshot(snapshot);
    setVersionSnapshots(prev => [...prev, snapshot]);
    alert(`Version snapshot "${versionName}" saved. View matrix in "Version Comparison".`);
  };

  // Delete version snapshot
  const handleDeleteSnapshot = async (id: string) => {
    await deleteVersionSnapshot(id);
    setVersionSnapshots(prev => prev.filter(s => s.id !== id));
  };

  // Restore snapshot as active workspace
  const handleRestoreSnapshot = (snapshot: PlanVersionSnapshot) => {
    handleUpdateModel(snapshot.lineModel);
    setActiveTab('overview');
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
    link.setAttribute('download', `${activeModel.name}_capacity_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeModel, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeModel.id}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string) as ProductionLineModel;
        if (imported.id && imported.stations) {
          handleUpdateModel(imported);
          alert(`Successfully imported model: ${imported.name}`);
        } else {
          alert('Invalid JSON config file format');
        }
      } catch (err) {
        alert('Failed to parse JSON config file');
      }
    };
    reader.readAsText(file);
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
      
      {/* Top Navbar Header */}
      <Navbar
        models={models}
        activeModel={activeModel}
        onSelectModel={(id) => setActiveModelId(id)}
        onSaveModel={handleSaveModel}
        onOpenVersions={() => setActiveTab('compare')}
        onToggleWhatIf={() => {
          setIsWhatIfActive(!isWhatIfActive);
          if (!isWhatIfActive) setActiveTab('whatif');
        }}
        isWhatIfActive={isWhatIfActive}
        onOpenReport={() => setIsReportOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:py-6 space-y-6">
        
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
              onStationSelect={(id) => {
                setActiveTab('modeling');
              }}
            />

            <StationHeatmap
              result={baselineResult}
              lang={lang}
              onSelectStation={(id) => {
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
            onUpdateModel={handleUpdateModel}
            lang={lang}
          />
        )}

        {/* Tab 3: Station Line Modeling */}
        {activeTab === 'modeling' && (
          <LineModelingView
            model={activeModel}
            onUpdateModel={handleUpdateModel}
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
            snapshots={versionSnapshots}
            onDeleteSnapshot={handleDeleteSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onExportCompareCsv={handleExportCsv}
            lang={lang}
          />
        )}

      </main>

      {/* Command Palette Modal (Cmd + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        models={models}
        activeModel={activeModel}
        onSelectModel={(id) => setActiveModelId(id)}
        onSaveModel={handleSaveModel}
        onOpenReport={() => setIsReportOpen(true)}
        onExportJson={handleExportJson}
        onImportJsonClick={() => {
          const input = document.querySelector('input[type="file"][accept=".json"]') as HTMLInputElement;
          input?.click();
        }}
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
            IVES BESS-Planner Pro · Battery Storage Container Assembly Planning & Offline PWA System
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            IndexedDB Storage · Takt Time Modeling · GWh Capacity Planning
          </div>
        </div>
      </footer>

      </div>
  );
}
