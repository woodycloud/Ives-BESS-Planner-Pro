import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: AI BESS Line Balancing Advisor powered by Gemini
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Missing GEMINI_API_KEY environment variable. Please configure it in AI Studio Secrets.",
        });
      }

      const { lineModel, calculationResult, whatIfConfig } = req.body;

      if (!lineModel || !calculationResult) {
        return res.status(400).json({ error: "Invalid line model or calculation payload." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `你是一位拥有20年储能系统（BESS Container）自动化制造与精益生产经验的首席产线专家。
请根据以下 BESS 储能集装箱产线建模与产能规划数据，提供专业、可落地的瓶颈诊断与产线平衡优化建议。

【产线基本信息】
- 方案名称: ${lineModel.name} (${lineModel.version})
- 集装箱规格: ${lineModel.containerSpec.name} (${lineModel.containerSpec.energyCapacityMWh} MWh/台)
- 班次模式: 每日 ${lineModel.shiftConfig.shiftsPerDay} 班, 每班 ${lineModel.shiftConfig.hoursPerShift} 小时, 年工作 ${lineModel.shiftConfig.operatingDaysPerYear} 天
- 目标年产能: ${lineModel.targetAnnualGWh} GWh
- 实际预估年产能: ${calculationResult.annualGWhOutput} GWh (目标达成率: ${calculationResult.capacityTargetMetPercent}%)
- 实际日产能: ${calculationResult.dailyUnitsOutput} 台/天 (${calculationResult.dailyMWhOutput} MWh/天)

【产线平衡与瓶颈指标】
- 产线实际节拍 (Takt Time): ${calculationResult.lineTaktTimeMin} 分钟/台
- 客户需求节拍: ${calculationResult.demandTaktTimeMin} 分钟/台
- 产线平衡率: ${calculationResult.lineBalanceRatioPercent}% (平衡损失率: ${calculationResult.balanceLossPercent}%)
- 瓶颈工站: ${calculationResult.bottleneckStationCode} - ${calculationResult.bottleneckStationName} (Cycle Time: ${calculationResult.bottleneckCycleTimeMin} 分钟)
- 整线直通率 (FPY): ${calculationResult.lineFPYPercent}%
- 平均 OEE: ${calculationResult.averageOEEPercent}%
- 投资效率: ${calculationResult.investmentPerGWh} 万元/GWh (总设备投资: ${calculationResult.totalEquipmentCost} 万元, 总工人数: ${calculationResult.totalOperators}人)

【工站明细表】
${calculationResult.stationMetrics
  .map(
    (s: any) =>
      `- [${s.code}] ${s.name}: CT=${s.effectiveCycleTimeMin}min, 负荷率=${s.utilizationRatePercent}%, OEE=${s.effectiveOEEPercent}%, 是否瓶颈=${s.isBottleneck ? '是[★]' : '否'}`
  )
  .join('\n')}

请按以下格式输出中文专家诊断报告（语言专业严谨、切中储能集装箱制造痛点，Markdown格式）：
1. **瓶颈致命性分析**：重点诊断 ${calculationResult.bottleneckStationName} 成为瓶颈的原因（如工序繁重、激光焊/充放电测试时间长、设备单点约束等）。
2. **三步走优化提升方案**：
   - 方案一：低成本精益改善（调整工序拆分、减步、人员配比、工装治具优化）。
   - 方案二：设备与并线扩容（如增设激光焊并线工位、充放电测试台阵列扩展），并估算提升后的节拍与产能。
   - 方案三：自动化升级（如引入AGV/多轴伺服拧紧机器人）及预计 ROI 效果。
3. **关键质量控制与风险警示**：结合储能集装箱绝缘阻值(>2GΩ)、高压柜1500V安全、充放电温升及消防保压等特性给出2条防错建议。
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return res.json({
        advisorReport: response.text || "暂无建议生成",
      });
    } catch (err: any) {
      console.error("Gemini Advisor API Error:", err);
      return res.status(500).json({
        error: "AI 产能诊断服务异常: " + (err.message || String(err)),
      });
    }
  });

  // Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
