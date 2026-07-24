import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Activity, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight,
  Flame,
  Truck,
  Search,
  Scale
} from 'lucide-react';
import { Language } from '../utils/i18n';

interface BessProcessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const BessProcessGuideModal: React.FC<BessProcessGuideModalProps> = ({
  isOpen,
  onClose,
  lang = 'zh'
}) => {
  const [activeTab, setActiveTab] = useState<'spec' | 'cell' | 'welding' | 'pack' | 'container' | 'testing'>('spec');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md transition-opacity">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'BESS Manufacturing Process & EOL Quality Standard' : '储能集装箱 (BESS) 制造工艺流程与 EOL 品质控制工程规范'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en' 
                  ? 'Reference for 5MWh vs 6.25MWh Takt, 1-2-1 cell binning, laser welding, HiPot & 3-Tier BMS FAT'
                  : '涵盖 5MWh与6.25MWh 对标节拍、电芯 1-2-1 分选容差、激光焊检验、-80kPa 气密性与三级 BMS 绝缘耐压标准'}
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

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-black/[0.01] dark:bg-white/[0.01] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('spec')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'spec'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '5MWh vs 6.25MWh Spec' : '5MWh vs 6.25MWh 规格对标'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cell')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'cell'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Cell Binning (1-2-1)' : '电芯分选配组 (1-2-1规则)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('welding')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'welding'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Laser Welding' : '激光焊接与熔深质量'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pack')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'pack'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'PACK & Air-tightness' : 'PACK 装配与-80kPa气密性'}</span>
          </button>

          <button
            onClick={() => setActiveTab('container')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'container'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Container Integration' : '舱体集成与高压汇流'}</span>
          </button>

          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'testing'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'FAT & BMS 3-Tier Test' : '弱电/绝缘>2GΩ/三级BMS及FAT'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* TAB 1: 5MWh vs 6.25MWh SPEC COMPARISON */}
          {activeTab === 'spec' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#007AFF]/5 dark:bg-[#007AFF]/10 border border-[#007AFF]/20">
                <h3 className="text-sm font-bold text-[#007AFF] flex items-center space-x-1.5">
                  <Scale className="w-4 h-4" />
                  <span>5MWh 与 6.25MWh 集装箱制造周期与生产节拍对标 (Takt Time Benchmark)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  随着行业向 20 尺高柜超高密度演进，6.25MWh 相比主流 5MWh 电芯处理量增加 25%，液冷管路与高压节点增多，导致线体节拍与出厂 FAT 调试时长拉长。
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-black/[0.03] dark:bg-white/[0.05] font-semibold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">对标维度 (Dimension)</th>
                      <th className="py-2.5 px-3">5.01MWh 标配储能舱 (L5000)</th>
                      <th className="py-2.5 px-3 text-[#007AFF]">6.25MWh 高密储能舱 (L6250)</th>
                      <th className="py-2.5 px-3">制造周期差异与工艺影响</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">电芯数量与架构</td>
                      <td className="py-2.5 px-3">~4,992 颗 314Ah (416S12P)</td>
                      <td className="py-2.5 px-3 font-bold text-[#007AFF]">~6,240 颗 314Ah/500Ah+</td>
                      <td className="py-2.5 px-3 text-slate-500">电芯加工总量增加 +25%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">电芯段加工 (15 PPM节拍)</td>
                      <td className="py-2.5 px-3">~5.5 小时/舱</td>
                      <td className="py-2.5 px-3 font-bold text-[#007AFF]">~7.0 小时/舱 (+27%)</td>
                      <td className="py-2.5 px-3 text-slate-500">电芯分选与激光巴排焊接时间拉长</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">PACK 模组/簇数量</td>
                      <td className="py-2.5 px-3">80 - 96 个 PACK (12 簇)</td>
                      <td className="py-2.5 px-3 font-bold text-[#007AFF]">100 - 120 个 PACK (15 簇)</td>
                      <td className="py-2.5 px-3 text-slate-500">机械抓取与高压接线工时增加 2-4h</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">出厂 FAT 充放电测试</td>
                      <td className="py-2.5 px-3">24 - 36 小时</td>
                      <td className="py-2.5 px-3 font-bold text-[#007AFF]">36 - 48 小时 (+33%)</td>
                      <td className="py-2.5 px-3 text-slate-500">BMS 压差平衡与高容量数据采集增加</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">总流转生产周期 (Turnaround)</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600">3 - 5 天/台</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-600">5 - 7 天/台</td>
                      <td className="py-2.5 px-3 text-slate-500">需配合 MES 实时补偿直通率升至 96%+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CELL BINNING 1-2-1 */}
          {activeTab === 'cell' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>电芯电性能一致性分选配组 —— “1-2-1 原则”工程规范</span>
                </h3>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  储能电池由单体电芯 (磷酸铁锂 LFP 铝壳 314Ah/500Ah+) 成组。为确保长达 10-15 年循环寿命，分选工站需严格执行“1-2-1 容差控制”：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">开路电压 OCV</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">≤ 1% 偏差</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">静态压差 &lt; 20mV，确保无过充过放盲区</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">标称容量 Capacity</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">≤ 2% 偏差</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">放电量需大于标定值 (如 &gt; 240Ah/314Ah)</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">直流内阻 DCIR</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">≤ 1% 偏差</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">控制发热源与端子温升一致性</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">极性检测与自放电 K 值筛选：</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>CCD 视觉极性防错：</strong>电芯自动入模前必须经过高帧率 CCD 视觉，防范极柱倒置导致短路爆炸。</li>
                  <li><strong>自放电 K 值计算：</strong>静置高温库 14 天监测电压降 $\Delta V/\Delta t$，剔除自放电过快的微短路隐患电芯。</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: LASER WELDING */}
          {activeTab === 'welding' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <h3 className="font-bold text-amber-600 dark:text-amber-400 text-sm flex items-center space-x-1.5">
                  <Flame className="w-4 h-4" />
                  <span>模组/PACK 激光焊接工序 (Laser Welding Quality Control)</span>
                </h3>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  电池模组与巴排激光焊接是 PACK 生产中最关键工序，直接决定接触电阻与运行安全：
                </p>
                <ul className="mt-2 space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4">
                  <li><strong>焊缝熔深与平整度：</strong>焊缝必须保证全透或特定要求熔深，焊缝高度与极片平齐，严禁凹陷或熔穿极片。</li>
                  <li><strong>焊渣飞溅实时清除：</strong>焊接头需配置吸尘与气帘系统，飞溅物及表面焊渣必须立即清除，防止微粒掉入箱体引起短路。</li>
                  <li><strong>红外热成像点检：</strong>在大倍率充放电下通过红外相机监控巴排温升，快速识别接触电阻偏大的虚焊点。</li>
                  <li><strong>巴排剪切力拉力测试：</strong>连接铝排/铜巴排拉力测试需 ≥ 600N，金相试验分析熔池组织。</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: PACK & AIR-TIGHTNESS */}
          {activeTab === 'pack' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <h3 className="font-bold text-[#007AFF] text-sm flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />
                  <span>PACK 绝缘测试与 -80kPa 气密保压规范</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-blue-500/20">
                    <span className="font-bold text-[#007AFF] block">PACK 级对壳绝缘电阻</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">&gt; 20 MΩ (500V DC)</span>
                    <p className="text-[11px] text-slate-500 mt-1">正负极插件对电池包壳体施加高压，防止漏电。</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-blue-500/20">
                    <span className="font-bold text-[#007AFF] block">液冷管路气密保压</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">-80 kPa (保压 60s)</span>
                    <p className="text-[11px] text-slate-500 mt-1">负压保压与氦气检漏，严防冷却液泄露至高压部件。</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">装配过程防错细节：</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  封盖板时需确保冷却风机线与温度传感器束未被卡在箱体边缘；电池包转运时加装正负极防防护帽，严防硬物碰伤接口。
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: CONTAINER INTEGRATION */}
          {activeTab === 'container' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <h3 className="font-bold text-purple-600 dark:text-purple-400 text-sm flex items-center space-x-1.5">
                  <Truck className="w-4 h-4" />
                  <span>舱体预装、高压汇流柜与重载吊装防范</span>
                </h3>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  电池舱（集装箱）由 300~480 个 PACK、电池架、高压箱、汇流柜 (1000V/1500V, 1000A) 及工业空调和爱德华消防系统组成：
                </p>
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-purple-500/20">
                    <span className="font-bold text-purple-600 dark:text-purple-400">电池架与汇流柜：</span>
                    <span className="text-slate-700 dark:text-slate-300">核实断路器额定电压电流与承重刚度，焊缝受力点严禁影响插箱装配。</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-purple-500/20">
                    <span className="font-bold text-purple-600 dark:text-purple-400">重载吊装风险控制 (40t/3m)：</span>
                    <span className="text-slate-700 dark:text-slate-300">单个满载集装箱实际重约 40 吨，吊装方案需与现场吊卡核实一致，出厂前核对铭牌额定参数。</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TESTING & BMS 3-TIER */}
          {activeTab === 'testing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                <h3 className="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-1.5">
                  <Activity className="w-4 h-4" />
                  <span>弱电调试、绝缘电阻 &gt; 2GΩ 与三级 BMS 测试</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-rose-500/20">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">舱体正负极对地绝缘电阻</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">&gt; 2.0 GΩ (1000V DC)</span>
                    <p className="text-[11px] text-slate-500 mt-1">控制箱至汇流柜连接线及整舱系统耐压检测。</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#2c2c2e] rounded-xl border border-rose-500/20">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">三级 BMS (BMU-BCMS-BAMS) 架构</span>
                    <span className="text-slate-900 dark:text-white font-mono text-base font-bold">100% 数据采集与消防联动</span>
                    <p className="text-[11px] text-slate-500 mt-1">1级模组/2级簇/3级舱体，空调与气溶胶消防联动响应。</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">IPX5 淋雨与交直流 FAT 充放电：</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  全功率交直流充放电循环测试 (FAT) 验证 RTE 能量效率、温升平衡与充放电柜 CAN 协议，确保无 SOC 异常跳变。
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>IVES BESS Manufacturing Engineering Knowledge Base</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#007AFF] text-white font-semibold hover:bg-[#0066CC] transition"
          >
            {lang === 'en' ? 'Close Guide' : '已了解规范'}
          </button>
        </div>

      </div>
    </div>
  );
};
