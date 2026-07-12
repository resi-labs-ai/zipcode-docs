# Debt Write-Off

When a credit line becomes delinquent, its market value should reflect both the probability of loss and the probability of recovery. Instead of an immediate full markdown to zero, we apply a time-based linear markdown to delinquent credit: value starts near par and decays smoothly to zero over a configured duration T. This ensures that the markdown reflects real-world expectations while preserving the option for future recoveries. This reflects declining recovery likelihood while reducing panic risk from sudden write-downs, and keeps solvency accounting predictable. The total adjusted market value M (t) of a credit line is given by:

$$
m(t)=1-\min!\left(1,\frac{t}{T}\right)
$$

$$
\text{where }
\begin{cases}
\begin{aligned}
t &= \text{Time in days since delinquency began} \\
T &= \text{Full markdown duration from protocol config} \\

```
        m(t) &= \text{Market value multiplier} \\
    \end{aligned}
\end{cases}
```

$$

This model ensures an accurate valuation of non-performing credit lines while maintaining protocol solvency and preventing market panic from sudden markdowns to zero. This function ensures that in the early stages of delinquency, recoveries are still probable, reducing the markdown severity. However, as delinquency time increases, the likelihood of successful recovery diminishes. By dynamically adjusting for expected recovery, it provides a more nuanced and realistic approach to loss recognition. Credit lines are preemptively marked down to 0 cents on the dollar upon delinquency status in order to disincentivize runs on the money market.

The markdown algorithm may change as the protocol evolves and we collect more data points about historical recovery processes.

### Insurance Fund

3Jane has seeded $1M insurance fund which acts as first-loss capital in the case of any losses due to fraud risk and credit risk. The insurance fund steps in with a settle() call that preemptively makes funds whole at the default phase after which point 3Jane recovers funds on its own behalf to replenish the insurance fund.
