/**
 * IndexedDB Persistence Manager for BESS Line Models & Version Snapshots
 */

import { ProductionLineModel, PlanVersionSnapshot } from '../types/bess';
import { DEFAULT_LINE_MODELS } from './defaultPresets';

const DB_NAME = 'bess_pwa_capacity_planner_db';
const DB_VERSION = 1;

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

export async function initStorage(): Promise<ProductionLineModel[]> {
  try {
    const db = await openDatabase();
    const existingModels = await getAllModels(db);

    if (existingModels.length === 0) {
      // Seed default presets
      for (const model of DEFAULT_LINE_MODELS) {
        await saveModel(model);
      }
      return DEFAULT_LINE_MODELS;
    }

    // Check if any default presets are missing in existing models
    const existingIds = new Set(existingModels.map(m => m.id));
    const mergedModels = [...existingModels];
    
    for (const defaultModel of DEFAULT_LINE_MODELS) {
      if (!existingIds.has(defaultModel.id)) {
        await saveModel(defaultModel);
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
          const parsedIds = new Set(parsed.map(m => m.id));
          for (const defaultModel of DEFAULT_LINE_MODELS) {
            if (!parsedIds.has(defaultModel.id)) {
              parsed.push(defaultModel);
            }
          }
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_LINE_MODELS;
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
    // LocalStorage fallback
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
