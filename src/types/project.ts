import { ProductionLineModel, PlanVersionSnapshot } from './bess';

export type AutoSaveStatus = 'saved' | 'saving' | 'unsaved' | 'recovering';

export interface ProjectMetadata {
  id: string;                      // Unique UUID for project
  title: string;                   // Project Title (e.g., "IVES 5.01MWh 15PPM Line Planning")
  code: string;                    // Project Code (e.g., "PRJ-2026-BESS-01")
  author: string;                  // Lead Line Engineer / Planner Name
  description: string;             // Detailed description of the engineering project
  createdAt: string;               // ISO Timestamp
  updatedAt: string;               // ISO Timestamp
  templateId?: string;             // Reference template ID if created from preset
  tags: string[];                  // Engineering tags ["5MWh", "15PPM", "Gigafactory", "CTP"]
  versionTag: string;              // Project engineering version (e.g., "v1.2-Draft")
}

export interface ProjectSettings {
  currency: 'RMB' | 'USD' | 'EUR';
  taktTimeUnit: 'min' | 'sec';
  autoSaveEnabled: boolean;
  autoSaveIntervalMs: number;      // Default 2000ms
  showBottleneckAlerts: boolean;
}

export interface ProjectSummary {
  id: string;
  title: string;
  code: string;
  author: string;
  updatedAt: string;
  containerType: string;
  targetAnnualGWh: number;
  stationsCount: number;
  isAutoSaveDraft?: boolean;
}

// Unified Core Engineering Project Architecture
export interface Project {
  meta: ProjectMetadata;
  lineModel: ProductionLineModel;  // The underlying line parameters & stations
  settings: ProjectSettings;
  versions: PlanVersionSnapshot[]; // Saved version snapshots inside this project
  
  // Future Expansion Modules (Plug & Play without refactoring core model)
  processBalanceModule?: {
    targetEfficiencyRatio?: number;
    allowParallelLaneFlexing?: boolean;
    taktMarginPercent?: number;
  };
  simulationModule?: {
    runsCount?: number;
    stochasticVariabilityEnabled?: boolean;
  };
  collaborationModule?: {
    teamMembers?: string[];
    commentsCount?: number;
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  nameZh: string;
  category: 'Standard' | 'HighDensity' | 'Flexible' | 'Custom';
  description: string;
  descriptionZh: string;
  model: ProductionLineModel;
  tags: string[];
  containerCapacityMWh: number;
}
