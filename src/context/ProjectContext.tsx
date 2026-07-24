import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ProductionLineModel, PlanVersionSnapshot } from '../types/bess';
import { Project, ProjectMetadata, ProjectSettings, ProjectSummary, AutoSaveStatus } from '../types/project';
import { 
  initStorage, 
  getAllProjects, 
  getProject, 
  saveProject, 
  deleteProject, 
  saveProjectDraft, 
  getProjectDraft, 
  clearProjectDraft,
  createProjectFromModel,
  getAllVersionSnapshots,
  saveVersionSnapshot,
  deleteVersionSnapshot
} from '../utils/indexedDB';
import { PROJECT_TEMPLATES } from '../utils/projectTemplates';
import { calculateLineCapacity } from '../utils/capacityCalculator';

interface ProjectContextType {
  project: Project;
  allProjects: ProjectSummary[];
  isDirty: boolean;
  autoSaveStatus: AutoSaveStatus;
  lastSavedTime: string | null;
  hasRecoverableDraft: boolean;
  draftSavedTime: string | null;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  
  // Project Lifecycle Methods
  newProject: (templateId?: string, title?: string, code?: string) => Promise<void>;
  openProject: (projectId: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  saveProjectAs: (newTitle: string, newCode?: string) => Promise<void>;
  closeProject: () => Promise<void>;
  deleteProjectById: (projectId: string) => Promise<void>;
  
  // Draft Recovery Methods
  recoverDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  
  // Model & State Mutators
  updateLineModel: (updater: ProductionLineModel | ((prevModel: ProductionLineModel) => ProductionLineModel)) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  updateMeta: (meta: Partial<ProjectMetadata>) => void;
  
  // Version Snapshot Management
  addVersionSnapshot: (versionName: string, notes: string) => Promise<void>;
  deleteVersionSnapshotById: (versionId: string) => Promise<void>;
  
  // Export / Import JSON
  exportProjectJson: () => void;
  importProjectJson: (jsonString: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(() => {
    const defaultTemplate = PROJECT_TEMPLATES[0];
    return createProjectFromModel(defaultTemplate.model, 'Line Engineering Lead');
  });

  const [allProjects, setAllProjects] = useState<ProjectSummary[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(new Date().toLocaleTimeString());
  
  // Draft recovery state
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Global Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProjectJsonRef = useRef<string>(JSON.stringify(project));

  // Load projects list and check for recovery draft on initialization
  const refreshProjectsList = useCallback(async () => {
    try {
      const storedModels = await initStorage();
      const dbProjects = await getAllProjects();
      
      const summaries: ProjectSummary[] = dbProjects.map(p => ({
        id: p.meta.id,
        title: p.meta.title,
        code: p.meta.code,
        author: p.meta.author,
        updatedAt: p.meta.updatedAt,
        containerType: p.lineModel.containerSpec?.name || '5.01MWh',
        targetAnnualGWh: p.lineModel.targetAnnualGWh,
        stationsCount: p.lineModel.stations.length
      }));

      // Merge defaults if list empty
      if (summaries.length === 0 && storedModels.length > 0) {
        for (const m of storedModels) {
          const prj = createProjectFromModel(m);
          await saveProject(prj);
          summaries.push({
            id: prj.meta.id,
            title: prj.meta.title,
            code: prj.meta.code,
            author: prj.meta.author,
            updatedAt: prj.meta.updatedAt,
            containerType: prj.lineModel.containerSpec?.name || '5.01MWh',
            targetAnnualGWh: prj.lineModel.targetAnnualGWh,
            stationsCount: prj.lineModel.stations.length
          });
        }
      }

      setAllProjects(summaries);
    } catch (err) {
      console.error('Failed to refresh projects list:', err);
    }
  }, []);

  useEffect(() => {
    async function boot() {
      await refreshProjectsList();

      // Check draft recovery
      const draftRecord = await getProjectDraft();
      if (draftRecord && draftRecord.project) {
        setHasRecoverableDraft(true);
        setDraftSavedTime(new Date(draftRecord.savedAt).toLocaleTimeString());
      }
    }
    boot();

    // Online / Offline Listeners for PWA Offline mode
    const handleOnline = () => showToast('⚡ 已恢复网络连接，进入在线同步模式', 'info');
    const handleOffline = () => showToast('📡 网络已断开，已开启 PWA 离线本地持久化保障', 'info');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshProjectsList, showToast]);

  // Debounced Auto-Save Engine
  useEffect(() => {
    const currentJson = JSON.stringify(project);
    if (currentJson === lastSavedProjectJsonRef.current) {
      return;
    }

    setIsDirty(true);
    setAutoSaveStatus('unsaved');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (project.settings.autoSaveEnabled) {
      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving');
        try {
          await saveProjectDraft(project);
          setAutoSaveStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString());
        } catch (err) {
          console.warn('Auto-save failed:', err);
          setAutoSaveStatus('unsaved');
        }
      }, project.settings.autoSaveIntervalMs || 1500);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [project]);

  // Save current active project to IndexedDB
  const saveCurrentProject = async () => {
    setAutoSaveStatus('saving');
    try {
      const updatedProject: Project = {
        ...project,
        meta: {
          ...project.meta,
          updatedAt: new Date().toISOString()
        },
        lineModel: {
          ...project.lineModel,
          updatedAt: new Date().toISOString()
        }
      };

      await saveProject(updatedProject);
      await clearProjectDraft();

      setProject(updatedProject);
      lastSavedProjectJsonRef.current = JSON.stringify(updatedProject);
      setIsDirty(false);
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      setHasRecoverableDraft(false);

      await refreshProjectsList();
      showToast(`🎉 工程【${updatedProject.meta.title}】已成功推送并持久化至数据库！`, 'success');
    } catch (err) {
      console.error('Failed to save project:', err);
      setAutoSaveStatus('unsaved');
      showToast('❌ 工程推送与保存失败，请重试', 'error');
    }
  };

  // Create New Project from Template
  const newProject = async (templateId = 'tmpl-5mwh-standard', customTitle?: string, customCode?: string) => {
    const tmpl = PROJECT_TEMPLATES.find(t => t.id === templateId) || PROJECT_TEMPLATES[0];
    const newId = `prj-${Date.now()}`;
    
    const freshProject: Project = {
      meta: {
        id: newId,
        title: customTitle || `IVES ${tmpl.nameZh}`,
        code: customCode || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        author: 'Line Engineering Lead',
        description: tmpl.descriptionZh,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateId: tmpl.id,
        tags: tmpl.tags,
        versionTag: 'v1.0-Draft'
      },
      lineModel: {
        ...tmpl.model,
        id: `model-${newId}`,
        name: customTitle || tmpl.model.name,
        updatedAt: new Date().toISOString()
      },
      settings: {
        currency: 'RMB',
        taktTimeUnit: 'min',
        autoSaveEnabled: true,
        autoSaveIntervalMs: 2000,
        showBottleneckAlerts: true
      },
      versions: []
    };

    await saveProject(freshProject);
    setProject(freshProject);
    lastSavedProjectJsonRef.current = JSON.stringify(freshProject);
    setIsDirty(false);
    setAutoSaveStatus('saved');
    setLastSavedTime(new Date().toLocaleTimeString());

    await refreshProjectsList();
  };

  // Open existing saved Project
  const openProject = async (projectId: string) => {
    const targetProject = await getProject(projectId);
    if (targetProject) {
      setProject(targetProject);
      lastSavedProjectJsonRef.current = JSON.stringify(targetProject);
      setIsDirty(false);
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
    }
  };

  // Save Project As duplicate
  const saveProjectAs = async (newTitle: string, newCode?: string) => {
    const newId = `prj-${Date.now()}`;
    const duplicated: Project = {
      ...project,
      meta: {
        ...project.meta,
        id: newId,
        title: newTitle,
        code: newCode || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versionTag: `${project.meta.versionTag}-Copy`
      },
      lineModel: {
        ...project.lineModel,
        id: `model-${newId}`,
        name: newTitle,
        updatedAt: new Date().toISOString()
      }
    };

    await saveProject(duplicated);
    setProject(duplicated);
    lastSavedProjectJsonRef.current = JSON.stringify(duplicated);
    setIsDirty(false);
    setAutoSaveStatus('saved');
    setLastSavedTime(new Date().toLocaleTimeString());

    await refreshProjectsList();
  };

  // Close active project
  const closeProject = async () => {
    if (isDirty) {
      const confirmClose = window.confirm('当前项目有未保存的更改，确认要关闭并保存当前工程吗？');
      if (confirmClose) {
        await saveCurrentProject();
      }
    }
    await newProject('tmpl-5mwh-standard');
  };

  // Delete project
  const deleteProjectById = async (projectId: string) => {
    await deleteProject(projectId);
    await refreshProjectsList();
    if (project.meta.id === projectId) {
      await newProject('tmpl-5mwh-standard');
    }
  };

  // Recover Draft
  const recoverDraft = async () => {
    setAutoSaveStatus('recovering');
    const draftRecord = await getProjectDraft();
    if (draftRecord && draftRecord.project) {
      setProject(draftRecord.project);
      setIsDirty(true);
      setAutoSaveStatus('unsaved');
      setHasRecoverableDraft(false);
    }
  };

  // Discard Draft
  const discardDraft = async () => {
    await clearProjectDraft();
    setHasRecoverableDraft(false);
  };

  // Update Line Model
  const updateLineModel = (updater: ProductionLineModel | ((prevModel: ProductionLineModel) => ProductionLineModel)) => {
    setProject(prev => {
      const newModel = typeof updater === 'function' ? updater(prev.lineModel) : updater;
      return {
        ...prev,
        lineModel: {
          ...newModel,
          updatedAt: new Date().toISOString()
        },
        meta: {
          ...prev.meta,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Update Settings
  const updateSettings = (settings: Partial<ProjectSettings>) => {
    setProject(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
  };

  // Update Metadata
  const updateMeta = (meta: Partial<ProjectMetadata>) => {
    setProject(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        ...meta,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  // Version Snapshots
  const addVersionSnapshot = async (versionName: string, notes: string) => {
    const calcResult = calculateLineCapacity(project.lineModel);
    const snapshot: PlanVersionSnapshot = {
      id: `ver-${Date.now()}`,
      versionName,
      createdAt: new Date().toISOString(),
      notes,
      lineModel: project.lineModel,
      result: calcResult
    };

    await saveVersionSnapshot(snapshot);
    setProject(prev => ({
      ...prev,
      versions: [...prev.versions, snapshot]
    }));
  };

  const deleteVersionSnapshotById = async (versionId: string) => {
    await deleteVersionSnapshot(versionId);
    setProject(prev => ({
      ...prev,
      versions: prev.versions.filter(v => v.id !== versionId)
    }));
  };

  // JSON Export
  const exportProjectJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.meta.code}_${project.meta.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Import
  const importProjectJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.lineModel && parsed.meta) {
        const importedProject: Project = {
          ...parsed,
          meta: {
            ...parsed.meta,
            id: `prj-imported-${Date.now()}`,
            updatedAt: new Date().toISOString()
          }
        };
        await saveProject(importedProject);
        setProject(importedProject);
        lastSavedProjectJsonRef.current = JSON.stringify(importedProject);
        setIsDirty(false);
        setAutoSaveStatus('saved');
        await refreshProjectsList();
        return true;
      } else if (parsed && parsed.stations && parsed.name) {
        // Legacy ProductionLineModel file
        const legacyPrj = createProjectFromModel(parsed);
        await saveProject(legacyPrj);
        setProject(legacyPrj);
        lastSavedProjectJsonRef.current = JSON.stringify(legacyPrj);
        setIsDirty(false);
        setAutoSaveStatus('saved');
        await refreshProjectsList();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to import project JSON:', err);
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        allProjects,
        isDirty,
        autoSaveStatus,
        lastSavedTime,
        hasRecoverableDraft,
        draftSavedTime,
        toast,
        showToast,
        newProject,
        openProject,
        saveCurrentProject,
        saveProjectAs,
        closeProject,
        deleteProjectById,
        recoverDraft,
        discardDraft,
        updateLineModel,
        updateSettings,
        updateMeta,
        addVersionSnapshot,
        deleteVersionSnapshotById,
        exportProjectJson,
        importProjectJson
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
