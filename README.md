# Quant Research · 量化研究实验室

> 面向中国市场与全球资产的、以证据门禁为中心的原创中文量化研究工作台。

**项目定位**：不是可直接交易的机器人，而是可复核、可证伪的量化研究教材与交互实验室。

## 网站

- GitHub Pages（需在仓库 Settings → Pages 中将 Source 设置为 **Deploy from a branch**、Branch 选 **main / (root)**）：https://godblessren.github.io/Quant-Research/
- 仓库：https://github.com/GodBlessRen/Quant-Research

采用纯静态 HTML/CSS/JavaScript，无需服务器、密钥或 npm，直接打开 `index.html` 即可阅读。所有实验数据均来自用户输入或展示假设，**不接入实时行情、不发出订单**。

## 核心能力

- 原创中文研究章节：数据可得时点、时间序列验证、统计检验、IC/IR、因子拥挤、Regime、波动率、宏观状态、组合与执行、研究治理。
- 交互实验台：相关性与组合波动、交易成本侵蚀、IC/IR 假设、拥挤—压力二维状态、风控熔断不变量。
- 研究契约：每份结论都写明 Evidence / Alternative / Trigger / Invalidation / Review。
- 响应式布局、全文检索、阅读进度、亮暗主题、键盘可用性。
- 全部本地执行，无外部 API 和依赖。

## 阅读路径

1. **数据真实性**：数据时间戳 → 标签与验证 → 过拟合与试验记录
2. **Alpha 真实性**：IC/IR → 拥挤与相关 → Regime / 期权曲面
3. **交易真实性**：组合 → 成本与容量 → 风控 / 订单状态 → 成交归因
4. **系统真实性**：研究契约 → LLM 辅助研究 → 宏观状态

## 约束与已知边界

- 交互模型是**教育性简化模型**，不是历史估计器或投资建议。
- 任何置信度、预期收益、成本、容量、市场阶段都必须有真实数据与检验支撑。
- 研究框架不等于经实盘验证的 Alpha；本站未提供历史绩效声明。
- 网站未内置价格接口、账户连接或自动交易，适合 GitHub Pages 静态托管。

## 致谢与许可

受到 [Wayland Zhang《AI 量化交易：从0到1》](https://waylandz.com/quant-book/) 的量化系统工程教学启发。本仓库不是原书的转载或镜像。课程内容、交互模型、网页及代码为重新设计的原创呈现，并在相关章节指出简化假设及局限。

原书声明采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)；为清楚处理启发及改编的边界，本仓库**中文学习内容**同样遵循 CC BY-NC-SA 4.0（署名、非商业、相同方式共享）；本站**自行编写的代码**采用 MIT License。详情见 [ATTRIBUTION.md](./ATTRIBUTION.md) 与 [LICENSE-CODE](./LICENSE-CODE)。

## 发布 GitHub Pages

1. 将网页文件置于 main 分支根目录（本项目已按此结构准备）。
2. 访问 [仓库 Pages 设置](https://github.com/GodBlessRen/Quant-Research/settings/pages)。
3. `Build and deployment → Source → Deploy from a branch`；选择 `main` 和 `/(root)`，点击 Save。
4. 待 GitHub Pages 构建完成，打开 https://godblessren.github.io/Quant-Research/ 。

## 本地预览

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。

—— 研究可以大胆，证据必须保守。
