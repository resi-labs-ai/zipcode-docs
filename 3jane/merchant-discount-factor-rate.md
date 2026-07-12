# Merchant Discount Factor Rate

3Jane gives you an upfront advance and, in return, buys a fixed specified amount of your future yield. *The Discount Factor Rate (DFR) is a discount that reduces the specified amount if you repay the advance amount early, effectively charging you less. The discount shrinks towards zero over time as the days since funding increases.*

$$
\text{RP}(N) = A \times \left( 1 + \sum\_{n=1}^{N} \text{P}\_{n} \right)\\\[2em]
\text{DFR}(N) = 1 - \frac{\mathrm{RP}(N) - A}{\mathrm{A} \times (F-1)}
$$

$$
\begin{aligned}
N &: \text{days since funding} \\\[2pt]
A &: \text{advance amount at funding} \\\[2pt]
\text{F}   &: \text{fixed Factor (set at funding)} \\\[2pt]
\text{RP}   &: \text{repurchase amount by day N} \\\[2pt]
\text{DFR}   &: \text{discount factor rate by day N} \\\[2pt]
\text{P}\_{n}   &: \text{daily pacing increment} \\\[2pt]
\end{aligned}
$$

Each day, a tiny pacing increment is applied:

(1) base factor: the pool’s baseline conditions (utilization)

(2) credit risk factor: your credit risk profile

(3) urgency factor: whether you were late that day

Those three slices add up to your daily fraction P<sub>n</sub>​.<br>

$$
\begin{aligned}
\text{P}*{n}
&:  \text{B}*{n}
\+ \text{C}*{n}
\+ \text{L}*{n}  \\\[2pt]
\text{B}*{n} &: \text{implied base apy, expressed as a (1) day factor, pool-wide. Derived from the pool’s utilization curve} \\\[2pt]
\text{C}*{n}   &: \text{implied credit risk apy, expressed as a (1) day factor, per-user. Derived from the 3CA algorithm} \\\[2pt]
\text{L}\_{n}      &: \text{implied urgency apy, expressed as a (1) day factor, per-user. Applied on days flagged late} \\\[2pt]
\end{aligned}
$$

Note: DFR according to the formula is updated daily (as of 11:59 p.m. UTC). Your real-time DFR (and hence early payoff amount) will be updated to include time elapsed from last day DFR prior to payment.<br>

**Example:**

* Advance: **A = 100,000**
* Factor: **F = 1.15**
* Specified Amount: **A⋅F = 115,000**

<table data-header-hidden><thead><tr><th width="40" align="right"></th><th width="97.09765625" align="right">bn</th><th width="102.75" align="right"></th><th width="96.984375" align="right"></th><th width="96.81640625"></th><th width="101.39453125"></th><th width="86.421875"></th><th></th></tr></thead><tbody><tr><td align="right">D</td><td align="right">B<sub>n</sub></td><td align="right">C<sub>n</sub></td><td align="right">L<sub>n</sub></td><td>P<sub>n</sub></td><td>Sum P<sub>n</sub></td><td>RP(N)</td><td>DFR(N)</td></tr><tr><td align="right">1</td><td align="right">0.000115</td><td align="right">0.000049</td><td align="right">0</td><td>0.000164</td><td>0.000164</td><td>100,016</td><td>99.8904%</td></tr><tr><td align="right">2</td><td align="right">0.000112</td><td align="right">0.000052</td><td align="right">0</td><td>0.000164</td><td>0.000328</td><td>100,032</td><td>99.7808%</td></tr><tr><td align="right">3</td><td align="right">0.000117</td><td align="right">0.000046</td><td align="right">0.000136</td><td>0.000301</td><td>0.000630</td><td>100,063</td><td>99.5799%</td></tr><tr><td align="right">4</td><td align="right">0.000109</td><td align="right">0.000050</td><td align="right">0</td><td>0.000160</td><td>0.000790</td><td>100,079</td><td>99.4731%</td></tr><tr><td align="right">5</td><td align="right">0.000120</td><td align="right">0.000053</td><td align="right">0</td><td>0.000173</td><td>0.000964</td><td>100,096</td><td>99.3571%</td></tr></tbody></table>
