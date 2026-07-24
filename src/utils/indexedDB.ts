/**
 * IndexedDB Persistence Manager for BESS Line Projects & Version Snapshots
 */

import { ProductionLineModel, PlanVersionSnapshot } from '../types/bess';
import { Project, ProjectSummary } from '../types/project';
import { DEFAULT_LINE_MODELS } from './defaultPresets';

const DB_NAME = 'bess_pwa_capacity_planner_db';
const DB_VERSION = 2; // Upgraded version for full Project schema

const STORE_PROJECTS = 'projects';
const STORE_DRAFT = 'project_draft';
const STORE_MODELS = 'line_models';
const STORE_VERSIONS = 'version_snapshots';
const STORE_SETTINGS = 'app_settings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'meta.id' });
      }

      if (!db.objectStoreNames.contains(STORE_DRAFT)) {
        db.createObjectStore(STORE_DRAFT, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_MODELS)) {
        db.createObjectStore(STORE_MODELS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_VERSIONS)) {
        const verStore = db.createObjectStore(STORE_VERSIONS, { keyPath: 'id' });
        verStore.createIndex('lineModelId', 'lineModel.id', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

// Convert model to Project wrapper if needed
export function createProjectFromModel(model: ProductionLineModel, author = 'Line Engineer'): Project {
  return {
    meta: {
      id: `prj-${model.id}`,
      title: model.name,
      code: `PRJ-${model.id.toUpperCase()}`,
      author,
      description: model.description || 'BESS Production Line Capacity Project',
      createdAt: model.updatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: model.id,
      tags: [model.containerSpec?.name ? (model.containerSpec.energyCapacityMWh > 5.5 ? '6.25MWh' : '5MWh') : 'Standard', 'BESS'],
      versionTag: model.version || 'v1.0'
    },
    lineModel: model,
    settings: {
      currency: 'RMB',
      taktTimeUnit: 'min',
      autoSaveEnabled: true,
      autoSaveIntervalMs: 2000,
      showBottleneckAlerts: true
    },
    versions: []
  };
}

export async function initStorage(): Promise<ProductionLineModel[]> {
  try {
    const db = await openDatabase();
    const existingModels = await getAllModels(db);

    if (existingModels.length === 0) {
      // Seed default presets
      for (const model of DEFAULT_LINE_MODELS) {
        await saveModel(model);
        const prj = createProjectFromModel(model);
        await saveProject(prj);
      }
      return DEFAULT_LINE_MODELS;
    }

    // Check if any default presets are missing in existing models
    const existingIds = new Set(existingModels.map(m => m.id));
    const mergedModels = [...existingModels];
    
    for (const defaultModel of DEFAULT_LINE_MODELS) {
      if (!existingIds.has(defaultModel.id)) {
        await saveModel(defaultModel);
        const prj = createProjectFromModel(defaultModel);
        await saveProject(prj);
        mergedModels.push(defaultModel);
      }
    }

    return mergedModels;
  } catch (err) {
    console.warn('Falling back to LocalStorage for storage:', err);
    const localData = localStorage.getItem('bess_line_models');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_LINE_MODELS;
  }
}

// Full Project IndexedDB persistence
export async function saveProject(project: Project): Promise<void> {
  project.meta.updatedAt = new Date().toISOString();
  project.lineModel.updatedAt = project.meta.updatedAt;

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.put(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Also sync lineModel for backward compatibility
    await saveModel(project.lineModel);
  } catch (err) {
    console.warn('LocalStorage fallback for saveProject:', err);
    const localProjects = localStorage.getItem('bess_projects');
    let list: Project[] = localProjects ? JSON.parse(localProjects) : [];
    const idx = list.findIndex(p => p.meta.id === project.meta.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.push(project);
    }
    localStorage.setItem('bess_projects', JSON.stringify(list));
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const localProjects = localStorage.getItem('bess_projects');
    if (localProjects) {
      const list: Project[] = JSON.parse(localProjects);
      return list.find(p => p.meta.id === id) || null;
    }
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Project[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const localProjects = localStorage.getItem('bess_projects');
    return localProjects ? JSON.parse(localProjects) : [];
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const localProjects = localStorage.getItem('bess_projects');
    if (localProjects) {
      const list: Project[] = JSON.parse(localProjects);
      const filtered = list.filter(p => p.meta.id !== id);
      localStorage.setItem('bess_projects', JSON.stringify(filtered));
    }
  }
}

// Auto-Save Recovery Draft Store
export async function saveProjectDraft(project: Project): Promise<void> {
  const draftRecord = {
    id: 'active_draft',
    project,
    savedAt: new Date().toISOString()
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_DRAFT, 'readwrite');
      const store = transaction.objectStore(STORE_DRAFT);
      const request = store.put(draftRecord);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    localStorage.setItem('bess_project_draft', JSON.stringify(draftRecord));
  }
}

export async function getProjectDraft(): Promise<{ project: Project; savedAt: string } | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DRAFT, 'readonly');
      const store = transaction.objectStore(STORE_DRAFT);
      const request = store.get('active_draft');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_project_draft');
    return local ? JSON.parse(local) : null;
  }
}

export async function clearProjectDraft(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_DRAFT, 'readwrite');
      const store = transaction.objectStore(STORE_DRAFT);
      const request = store.delete('active_draft');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    localStorage.removeItem('bess_project_draft');
  }
}

async function getAllModels(db: IDBDatabase): Promise<ProductionLineModel[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_MODELS, 'readonly');
    const store = transaction.objectStore(STORE_MODELS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as ProductionLineModel[]);
    request.onerror = () => reject(request.error);
  });
}

export async function saveModel(model: ProductionLineModel): Promise<void> {
  model.updatedAt = new Date().toISOString();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_MODELS, 'readwrite');
      const store = transaction.objectStore(STORE_MODELS);
      const request = store.put(model);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_line_models');
    let models: ProductionLineModel[] = local ? JSON.parse(local) : [];
    const idx = models.findIndex(m => m.id === model.id);
    if (idx >= 0) {
      models[idx] = model;
    } else {
      models.push(model);
    }
    localStorage.setItem('bess_line_models', JSON.stringify(models));
  }
}

export async function deleteModel(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_MODELS, 'readwrite');
      const store = transaction.objectStore(STORE_MODELS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_line_models');
    if (local) {
      const models: ProductionLineModel[] = JSON.parse(local);
      const filtered = models.filter(m => m.id !== id);
      localStorage.setItem('bess_line_models', JSON.stringify(filtered));
    }
  }
}

export async function getAllVersionSnapshots(): Promise<PlanVersionSnapshot[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_VERSIONS, 'readonly');
      const store = transaction.objectStore(STORE_VERSIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as PlanVersionSnapshot[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_version_snapshots');
    return local ? JSON.parse(local) : [];
  }
}

export async function saveVersionSnapshot(snapshot: PlanVersionSnapshot): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_VERSIONS, 'readwrite');
      const store = transaction.objectStore(STORE_VERSIONS);
      const request = store.put(snapshot);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_version_snapshots');
    let list: PlanVersionSnapshot[] = local ? JSON.parse(local) : [];
    list.push(snapshot);
    localStorage.setItem('bess_version_snapshots', JSON.stringify(list));
  }
}

export async function deleteVersionSnapshot(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_VERSIONS, 'readwrite');
      const store = transaction.objectStore(STORE_VERSIONS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('bess_version_snapshots');
    if (local) {
      const list: PlanVersionSnapshot[] = JSON.parse(local);
      const filtered = list.filter(s => s.id !== id);
      localStorage.setItem('bess_version_snapshots', JSON.stringify(filtered));
    }
  }
}
