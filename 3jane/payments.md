# Payments

### **AUM Threshold**

$$
R\_\text{t-1,t}=\begin{cases}
0, & \min(x\*P\_\text{t-1}, Y)> V\_\text{t-1,1} \ V\_\text{t-1,1}, & \text{otherwise}
\end{cases}
$$

$$
\begin{aligned}
P\_\text{t-1}   &: \text{Portfolio risk adjusted value at (t-1)} \\
P\_\text{t}     &: \text{Portfolio risk adjusted value at (t)} \\
V\_\text{t-1,t} &: \text{Difference in portfolio risk adjusted value between (t) and (t-1)} \\
x              &: \text{Parameter determining the relative amount for a repayment to be triggered} \\
Y              &: \text{Parameter determining the absolute amount threshold for a repayment to be triggered} \\
P &: \min(\max(LTV\_p, LTV\_{min}), LTV\_{max}) \\
LTV\_p &: \sum{(1+\kappa(\text{vs}*a-\text{ls}*a))\*\text{dp}*a} \\
k &: \text{Risk aversion parameter} \\
vs*\text{a} &: \text{Volatility assessment for asset (a), it is computed using a weighted average} \\
&\quad \text{of VaR values and Expected Shortfall values under different market scenarios.} \\
&\quad \text{The score represents potential loss for this asset over the repayment term (30 days)} \\
&\quad \text{at the 0.5% confidence interval.} \\\[4pt]
ls*\text{a} &: \text{Liquidity assessment for asset (a), it is computed by looking at the slippage} \\
&\quad \text{to sell the asset assuming different market conditions (normal and stressed).} \\
&\quad \text{The score represents an estimated cost to liquidate the asset.} \\
dp*\text{a} &: \text{Data penalty for asset a, based on the length of historical data available for this asset.}
\end{aligned}
$$

### **Discounted Monthly Payment**

Each month the merchant must make the following minimum payment to maintain good standing:

If extending credit line midcycle, next first repayment cycle has a discounted monthly payment of 0.

Else, next discounted monthly payment is: Monthly Payment \* (1 - (P\_t-1 - P\_t) / P\_t)

In the case that the monthly payment is 0, no payment is required. Payment amounts are finalized and displayed on the 15th of each month ahead of the following payment date.

Telegram payment reminders: [https://t.me/+gkYFIkjw4DFjMTMx<br>](https://t.me/+gkYFIkjw4DFjMTMx)

**Monthly Sync & Parameter Refresh**

Credit Limits and default-risk premiums are re-evaluated every 30 days using the latest bank-cash, CEX balances, and on-chain asset data.
