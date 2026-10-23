# Quant Research · 完整量化教材与研究实验室

> **完整原文 + 独立校勘 + 交互实验，而不是缩写版大纲。**

**在线阅读**：[https://godblessren.github.io/Quant-Research/](https://godblessren.github.io/Quant-Research/)

本项目收录 Wayland Zhang [《AI量化交易从0到1》](https://waylandz.com/quant-book/) **完整中文版**，再以独立的 Quant Research 研究文章补充统计严谨性、量化工程可靠性和中美宏观研究方法。

## 内容到底有多少？

| 内容 | 文件数 | 状态 |
| --- | ---: | --- |
| 课程正文 | **22课** | 完整原文 |
| 背景知识 | **30篇** | 完整原文 |
| 四份附录 | **4篇** | 完整原文 |
| 数据/API/资源 | **9篇** | 完整原文 |
| 书籍与分部导读 | **6篇** | 完整原文 |
| 原书 SVG 图表 | **69张** | 原图保留 |
| 独立研究增补 | **6篇** | 原创扩展 |
| 交互实验台 | **1套** | 原创演示 |

即原书中文版共 **71 份 Markdown 文档和 69 张 SVG 图**，另有本站独立撰写的深入研究增补。

## 功能

- **完整教材阅读器**：分部、正式课程、背景知识、附录和数据资料的完整侧边目录；上一篇/下一篇；本章目录；阅读位置与深色模式。
- **全文检索**：搜索全部 71 篇原文的标题和正文（首次搜索会载入全文索引）。
- **公式、代码、图示**：Markdown 表格、代码块、复制代码、SVG 原图与 MathJax 公式排版。
- **独立研究校勘**：涉及回测时点、未来标签、IC/IR 换算、Regime 置信度、熔断执行等问题时，旁边有独立批注，不混入原书正文。
- **交互实验**：[相关性与组合波动、成本侵蚀、风险熔断](./lab/)；只作教学情景，不接真实行情。
- **适配 GitHub Pages**：纯静态、无后端与密钥、手机及桌面可读。

## 仓库目录

```text
Quant-Research/
├── index.html                 # 完整教材阅读器
├── site.css / site.js         # 阅读器界面与交互
├── book/
│   ├── cn/                    # 原书71篇Markdown + 69张SVG（原路径层级）
│   ├── manifest.json          # 自动生成的完整章节目录
│   └── search-index.json      # 全文检索索引
├── research/                  # 六篇独立原创研究与统计校勘
├── lab/index.html             # 交互实验台（与教材分离）
├── .github/workflows/
│   ├── import-book.yml        # 版权信息固定、版本钉住的全量导入
│   └── deploy.yml             # 内容与JS检验 + GitHub Pages
├── ATTRIBUTION.md             # 原作者、许可证、改编说明
└── LICENSE-CODE              # 仅本项目自编网站代码使用MIT
```

## 数据来源、版本与版权

**教材原作者：Wayland Zhang**。原书来源为 https://github.com/waylandzhang/ai-quant-book ，已固定版本 `0f1cf8b68fa4a06b49efc0355d7b86b920e32c93`。站内原书内容均保留原文，不会将其冒充为本站原创；**完整教材与其改编内容按照原书 CC BY-NC-SA 4.0 许可使用**，要求署名、非商业和相同方式共享。浏览器端自编程序部分为 MIT。

详见 [ATTRIBUTION.md](./ATTRIBUTION.md)，原书许可证说明 https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans 。

## 一键部署 / 手动构建

本仓库 main 分支根目录含 `index.html`，GitHub Pages 设置为 `Deploy from a branch → main → /(root)` 即可展示。

仓库自带 GitHub Actions 发布工作流；每次 push 由 `deploy.yml` 验证章节文件完整性、JS 语法再发布。如需重新导入原书固定版本，手动运行 `Import complete licensed textbook` 工作流（不自动跟随上游版本）。

静态预览（需支持 HTTP 的本地服务器，不能只双击打开 HTML）：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

Markdown 排版引擎已固定版本并放入本仓库 `vendor/markdown-it.min.js`，正常阅读不依赖外部 Markdown CDN；数学排版 MathJax 仍为可选的在线增强。即使排版组件加载失败，网页也会回退为原始 Markdown 文本，保留全部内容。\n\n每次发布验证 `node --check site.js`、71 份原文与 69 张图片；仓库还提供 [浏览器回归测试](./tests/browser-smoke.cjs)（Chrome / Playwright）和 [公网网站健康检查](./.github/workflows/public-site.yml)。

## 使用边界

- **网站不是交易机器人**，没有行情密钥、券商 API、账户访问与自动下单。
- 书中策略和历史案例均只供教育研究；任何收益数字都不代表本站进行了复现或实盘证明。
- 市场研究结论必须注明数据日期、样本范围与失效条件，不能只凭某个指标给出必然涨跌结论。

> 研究可以大胆，证据必须保守。
