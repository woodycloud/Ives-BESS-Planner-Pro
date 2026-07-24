import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  Plus, 
  Copy, 
  Trash2, 
  FileText, 
  Check, 
  Clock, 
  Search, 
  Sparkles, 
  Download, 
  Upload,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { PROJECT_TEMPLATES } from '../utils/projectTemplates';
import { Language } from '../utils/i18n';

interface ProjectMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'new' | 'open' | 'saveAs' | 'recent';
  lang?: Language;
}

export const ProjectMenuModal: React.FC<ProjectMenuModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'open',
  lang = 'zh'
}) => {
  const { 
    project, 
    allProjects, 
    newProject, 
    openProject, 
    saveProjectAs, 
    deleteProjectById,
    exportProjectJson,
    importProjectJson
  } = useProject();

  const [activeTab, setActiveTab] = useState<'new' | 'open' | 'saveAs'>(
    initialTab === 'saveAs' ? 'saveAs' : initialTab === 'new' ? 'new' : 'open'
  );

  // New Project State
  const [selectedTemplateId, setSelectedTemplateId] = useState(PROJECT_TEMPLATES[0].id);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');

  // Save As State
  const [saveAsTitle, setSaveAsTitle] = useState(`${project.meta.title} (副本)`);
  const [saveAsCode, setSaveAsCode] = useState(`${project.meta.code}-COPY`);

  const [searchQuery, setSearchQuery] = useState('');

  // Sync state when modal opens or initialTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'saveAs' ? 'saveAs' : initialTab === 'new' ? 'new' : 'open');
      setSaveAsTitle(`${project.meta.title} (副本)`);
      setSaveAsCode(`${project.meta.code}-COPY`);
    }
  }, [isOpen, initialTab, project.meta.title, project.meta.code]);

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    const tmpl = PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId) || PROJECT_TEMPLATES[0];
    const title = newProjectTitle.trim() || `IVES ${tmpl.nameZh}`;
    const code = newProjectCode.trim() || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    await newProject(selectedTemplateId, title, code);
    onClose();
  };

  const handleOpenSelected = async (id: string) => {
    await openProject(id);
    onClose();
  };

  const handleSaveAsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveAsTitle.trim()) return;
    await saveProjectAs(saveAsTitle.trim(), saveAsCode.trim());
    onClose();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const success = await importProjectJson(text);
    if (success) {
      alert(lang === 'en' ? 'Project successfully imported!' : '工程项目导入成功！');
      onClose();
    } else {
      alert(lang === 'en' ? 'Failed to parse JSON file.' : '项目JSON文件格式不兼容，解析失败。');
    }
  };

  const filteredProjects = allProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.containerType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Project Management Architecture' : '储能产线工程项目管理中心 (Project Manager)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en' 
                  ? 'Unified engineering state for models, capacity, stations & version history'
                  : '面向工业级的工程项目核心对象，共享产能、工站与仿真全栈状态'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-black/[0.01] dark:bg-white/[0.01] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'open'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Open Project' : '打开工程项目'} ({allProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'new'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'New Project' : '新建工程项目'}</span>
            </button>

            <button
              onClick={() => setActiveTab('saveAs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'saveAs'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Save As...' : '另存为工程副本 (Save As)'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportProjectJson}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] transition flex items-center space-x-1"
              title="导出当前工程 JSON 文件"
            >
              <Download className="w-3 h-3" />
              <span>导出 JSON</span>
            </button>

            <label className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] cursor-pointer transition flex items-center space-x-1">
              <Upload className="w-3 h-3" />
              <span>导入 JSON</span>
              <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
            </label>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* TAB: OPEN PROJECT */}
          {activeTab === 'open' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Search project title, code or specification...' : '搜索工程标题、代码或舱体规格...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredProjects.map((p) => {
                  const isActive = p.id === project.meta.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[#007AFF]/10 border-[#007AFF]/40 ring-1 ring-[#007AFF]'
                          : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08] hover:border-[#007AFF]/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#007AFF]/20 text-[#007AFF]">
                            {p.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {p.title}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              当前工作区
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
                          <span>规格: {p.containerType}</span>
                          <span>·</span>
                          <span>目标产能: {p.targetAnnualGWh} GWh</span>
                          <span>·</span>
                          <span>工站数: {p.stationsCount}</span>
                          <span>·</span>
                          <span>更新时间: {new Date(p.updatedAt).toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isActive && (
                          <button
                            onClick={() => handleOpenSelected(p.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066CC] transition flex items-center space-x-1"
                          >
                            <span>打开</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {allProjects.length > 1 && (
                          <button
                            onClick={async () => {
                              if (confirm(`确认要删除工程项目 "${p.title}" 吗？`)) {
                                await deleteProjectById(p.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition"
                            title="删除工程项目"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: NEW PROJECT FROM TEMPLATES */}
          {activeTab === 'new' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  选择工程项目规划模板 (Project Templates)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECT_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#007AFF]/10 border-[#007AFF] ring-1 ring-[#007AFF]'
                            : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <Zap className="w-3.5 h-3.5 text-[#007AFF]" />
                            <span>{tmpl.nameZh}</span>
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-[#007AFF]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {tmpl.descriptionZh}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          {tmpl.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Title & Code inputs */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">工程基本属性设置</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">工程项目名称 (Title)</label>
                    <input
                      type="text"
                      placeholder="e.g. IVES 5.01MWh 15PPM 储能舱工程"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#2c2c2e] border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">工程编码 (Code)</label>
                    <input
                      type="text"
                      placeholder="e.g. PRJ-2026-BESS-01"
                      value={newProjectCode}
                      onChange={(e) => setNewProjectCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#2c2c2e] border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold hover:bg-[#0066CC] transition shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>立即创建并加载工作区</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SAVE AS... */}
          {activeTab === 'saveAs' && (
            <form onSubmit={handleSaveAsSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#007AFF]/5 dark:bg-[#007AFF]/10 border border-[#007AFF]/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-[#007AFF] block text-sm">另存为独立工程副本</span>
                <p>将当前工程项目（含所有工站参数、GWh计算结果与版本快照）复制为新的独立文件对象。</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">新工程名称</label>
                  <input
                    type="text"
                    required
                    value={saveAsTitle}
                    onChange={(e) => setSaveAsTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">新工程编码</label>
                  <input
                    type="text"
                    required
                    value={saveAsCode}
                    onChange={(e) => setSaveAsCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold hover:bg-[#0066CC] transition shadow-xs flex items-center space-x-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>保存为新工程</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>当前工程: <strong className="text-slate-800 dark:text-slate-200">{project.meta.code} - {project.meta.title}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-medium hover:bg-black/[0.08] transition"
          >
            关闭窗口
          </button>
        </div>

      </div>
    </div>
  );
};
