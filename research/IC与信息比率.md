# IC、IR 与可实现收益

> **研究者独立校勘** · 对照原书第17课。重要结论：**预测统计量不等于资金账户收益率**。

## 1. 三个常被混为一谈的指标

**Information Coefficient（IC，信息系数）**，通常指某一期预测信号与事后资产收益的横截面相关程度：

$$
IC_t = \operatorname{Corr}_i(s_{i,t},r_{i,t+h})
$$

Pearson IC 测量线性关系；Rank IC（Spearman）测量秩关系。一个 Rank IC 为 0.05 的因子，并不是“能够取得 5% 收益”。

**Information Ratio（IR，信息比率）** 在投资组合语境下：

$$
IR = \frac{E[R_p-R_b]}{\sigma(R_p-R_b)}
$$

这里的分子是相对于基准的**主动收益**，分母是其主动风险（Tracking Error）。注意：某些因子研究另把“IC 时间序列的均值 / 标准差”也简称 ICIR，它与组合 IR 不是同一对象。

**Alpha** 在不同模型中也有不同定义：CAPM 回归截距、风险调整超额收益、模型预测信号的经济利润，都不应该随意互换。

## 2. 主动管理基本定律的边界

在满足一定独立性、预测校准及组合实现假设下，有一个广为使用的近似形式：

$$
IR \approx IC\sqrt{BR}\,TC
$$

- `IC`：预测质量。
- `BR`：有效独立下注数量（不是机械地把全年252个交易日当作252次独立预测）。
- `TC`：预测转化成真实可执行组合的效率（Transfer Coefficient），与约束、实际仓位构造有关。

该近似不是“所有策略的年化收益公式”，也不能直接告诉你交易成本、杠杆和主动风险预算。

如果假设投资组合 IR 可被稳定实现，且事先指定了年化主动风险 `TE`，才可以进一步得到：

$$
E[R_p-R_b] \approx IR\times TE
$$

这仍只是条件近似，并非市场必然兑现的结果；`IR` 本身的估计有不确定性，`TC` 与 `BR` 也常常受样本依赖与交易成本侵蚀。

## 3. 为什么不能直接用 IC×√252×σ 算收益

举例：两个因子的平均 IC 都是 0.05。

| 差异 | 因子 A | 因子 B |
| --- | --- | --- |
| 持有期限 | 数周 | 数分钟 |
| 交易次数 | 低 | 高 |
| 可成交容量 | 较高 | 较低 |
| 价差和冲击 | 相对较低 | 极高 |
| 模型实际可实现暴露 | 稳定 | 受限制 |

它们可能拥有相近的预测相关性，却有截然不同的净收益。再加上信号预测的方差、成交概率、收益离群值、做空成本、交易延迟和仓位优化方式，IC 并不足以确定 P&L。

真正的顺序应该是：

```
IC统计 → 因子组合构造 → 主动风险预算 → 交易约束
       → 费用/点差/冲击 → 净P&L与跟踪误差
```

## 4. 如何检验 IC 的稳健性

### A. 先冻结口径

明确横截面投资池、权重、行业中性化、收益观察期、复权、停牌/退市处理，以及 IC 是 Pearson 还是 Spearman。

### B. 不只看平均值

记录 IC 时间序列的均值、标准差、自相关、负值占比和极端市场分组。滚动 IC 衰减并不自动证明“模型需要在线学习”；也可能是噪声、交易规则改变或研究样本选取变化。

### C. 处理依赖和多重检验

持有期重叠会让相邻 IC 有自相关。传统独立样本 t 检验可能高估显著性。可根据结构采用 Newey–West、区块自助法（block bootstrap）等依赖稳健估计。

如果同时测试数百个因子，必须记录搜索路径，并分析多重试验偏差。若只拿胜者 IC 作报告，样本外往往容易回归均值。

### D. 检查成本弹性

把手续费、点差、换手率、订单占 ADV、延迟与容量压力设为扰动变量。成本敏感性比一个不变的“净收益固定扣减比例”更接近真实交易环境。

## 5. 一个零依赖教学示例

下面的例子演示 Rank IC 如何计算，不推断年化收益：

```python
from statistics import mean

def ranks(values):
    # 仅演示无并列值的情形
    order = sorted(range(len(values)), key=lambda i: values[i])
    out = [0] * len(values)
    for rank, index in enumerate(order, start=1):
        out[index] = rank
    return out

def correlation(xs, ys):
    mx, my = mean(xs), mean(ys)
    num = sum((x-mx)*(y-my) for x, y in zip(xs, ys))
    sx = sum((x-mx)**2 for x in xs)**0.5
    sy = sum((y-my)**2 for y in ys)**0.5
    return num / (sx*sy)

signal = [0.3, -0.2, 1.5, 0.1]
future_return = [0.04, -0.01, 0.02, 0.03]
rank_ic = correlation(ranks(signal), ranks(future_return))
print(f"Rank IC: {rank_ic:.3f}")
# 仅四个资产的演示样本，绝不能解读为统计显著。
```

生产级实现必须明确 ties、缺失、收益调整与横截面权重等问题。

## 6. 一句话校勘

> **IC 衡量预测力，IR 衡量风险调整后的主动结果；从 IC 到收益之间，隔着组合约束、风险预算、执行成本和统计不确定性。**

**参考**：原书第17课；Grinold & Kahn, *Active Portfolio Management*；量化回测多重检验与稳健性相关文献。