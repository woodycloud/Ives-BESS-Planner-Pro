import React, { useState } from 'react';
import { 
  FolderOpen, 
  Save, 
  Copy, 
  Plus, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  Download, 
  Upload, 
  X,
  FileCode2,
  Zap,
  Sparkles
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Language } from '../utils/i18n';

interface ProjectBarProps {
  onOpenProjectMenu: (tab?: 'new' | 'open' | 'saveAs') => void;
  lang?: Language;
}

export const ProjectBar: React.FC<ProjectBarProps> = ({
  onOpenProjectMenu,
  lang = 'zh'
}) => {
  const { 
    project, 
    isDirty, 
    autoSaveStatus, 
    lastSavedTime, 
    saveCurrentProject, 
    closeProject,
    hasRecoverableDraft,
    draftSavedTime,
    recoverDraft,
    discardDraft,
    allProjects,
    openProject
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const handlePushProject = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await saveCurrentProject();
  };

  return (
    <div className="relative z-50 bg-slate-900 text-white border-b border-slate-800 text-xs select-none">
      
      {/* Recovery Banner Alert if draft exists */}
      {hasRecoverableDraft && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-amber-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'en' 
                ? `Auto-recovery draft detected from ${draftSavedTime}. Restore unsaved changes?`
                : `检测到系统自动保存的恢复草案 (保存于 ${draftSavedTime})。是否恢复未保存的工程修改？`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={recoverDraft}
              className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer"
            >
              恢复草案
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              放弃
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 h-9 sm:h-10 flex items-center justify-between gap-2 sm:gap-4 text-xs overflow-hidden">
        
        {/* Left: Project Menu Dropdown & Project Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden min-w-0">
          
          {/* File Menu Dropdown Trigger */}
          <div className="relative flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60 shrink-0">
            <button
              type="button"
              onClick={() => onOpenProjectMenu('open')}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-md hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition cursor-pointer active:scale-95 text-[11px] sm:text-xs"
              title="打开工程管理中心"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>{lang === 'en' ? 'Project' : '工程菜单'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(prev => !prev);
              }}
              className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="工程快捷菜单"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl py-1.5 z-[60] text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProjectMenu('open');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-slate-200 cursor-pointer font-medium"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>工程项目中心 (Project Manager)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProjectMenu('new');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>新建工程项目 (New Project)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async (e) => {
                      setIsDropdownOpen(false);
                      await handlePushProject(e);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-slate-200 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>推送与保存工程 (Push & Save)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProjectMenu('saveAs');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-slate-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-400" />
                    <span>另存为工程副本 (Save As...)</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await closeProject();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-500/20 text-rose-300 flex items-center space-x-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>关闭工作区 (Close Workspace)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="h-3.5 sm:h-4 w-[1px] bg-slate-800 shrink-0" />

          {/* Active Project Title & Metadata - Clickable */}
          <button
            type="button"
            onClick={() => onOpenProjectMenu('open')}
            className="flex items-center space-x-1.5 sm:space-x-2 truncate hover:opacity-80 transition cursor-pointer text-left group min-w-0"
            title="点击打开工程项目管理中心"
          >
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-[#007AFF]/20 text-[#007AFF] shrink-0 group-hover:bg-[#007AFF]/30">
              {project.meta.code}
            </span>
            <span className="font-bold text-slate-200 truncate max-w-[80px] xs:max-w-[130px] sm:max-w-[220px] md:max-w-[320px] group-hover:text-white text-[11px] sm:text-xs">
              {project.meta.title}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 shrink-0">
              {project.lineModel.containerSpec?.name ? project.lineModel.containerSpec.name.split(' ')[0] : '5.01MWh'}
            </span>
          </button>

        </div>

        {/* Right: Auto-Save Status Indicator & Direct Save Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Recent Projects Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsRecentOpen(prev => !prev)}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center space-x-1"
            >
              <span>切换历史工程 ({allProjects.length})</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isRecentOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsRecentOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-64 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                    最近修改的工程项目
                  </div>
                  {allProjects.slice(0, 5).map(p => (
                    <button
                      key={p.id}
                      onClick={async () => {
                        setIsRecentOpen(false);
                        await openProject(p.id);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-white/10 flex items-center justify-between text-slate-200 ${
                        p.id === project.meta.id ? 'bg-[#007AFF]/20 text-[#007AFF] font-bold' : ''
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code} · {p.targetAnnualGWh} GWh</div>
                      </div>
                      {p.id === project.meta.id && <Check className="w-3.5 h-3.5 shrink-0 text-[#007AFF]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />

          {/* Auto Save Status Badge */}
          <div className="flex items-center space-x-1.5">
            {autoSaveStatus === 'saving' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">自动保存中...</span>
                <span className="inline sm:hidden">保存中...</span>
              </span>
            )}

            {autoSaveStatus === 'saved' && (
              <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold items-center space-x-1" title={`已保存于 ${lastSavedTime}`}>
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">已自动保存 ({lastSavedTime})</span>
                <span className="inline sm:hidden">已保存</span>
              </span>
            )}

            {autoSaveStatus === 'unsaved' && (
              <button
                type="button"
                onClick={handlePushProject}
                className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
                title="存在未保存的修改，点击立即推送与保存"
              >
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">未保存 (点击推送与保存) *</span>
                <span className="inline sm:hidden">未保存 *</span>
              </button>
            )}

            {autoSaveStatus === 'recovering' && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>草案恢复中...</span>
              </span>
            )}
          </div>

          {/* Manual Save / Push Project Button */}
          <button
            type="button"
            onClick={handlePushProject}
            className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center space-x-1 sm:space-x-1.5 cursor-pointer active:scale-95 shrink-0 ${
              isDirty
                ? 'bg-[#007AFF] text-white hover:bg-[#0066CC] shadow-md ring-2 ring-[#007AFF]/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">{lang === 'en' ? 'Push & Save' : '推送与保存工程'}</span>
            <span className="inline xs:hidden">{lang === 'en' ? 'Save' : '保存'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
