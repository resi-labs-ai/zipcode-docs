# Protocol Global Config

#### Credit Line Parameters

<table><thead><tr><th width="185.24609375">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><strong>MAX_LTV</strong></td><td>Sets the maximum loan-to-value ratio allowed for credit lines. Validates that <code>credit/vv ≤ maxLTV</code> to ensure borrowers maintain sufficient collateral.</td></tr><tr><td><strong>MAX_VV</strong></td><td>Sets the maximum value that can be verified for a single credit line. Prevents excessive single-position exposure by capping the verified value</td></tr><tr><td><strong>MAX_CREDIT_LINE</strong></td><td>Sets the maximum credit amount that can be extended to a merchant. Controls the upper bound of credit exposure per merchant.</td></tr><tr><td><strong>MIN_CREDIT_LINE</strong></td><td>Sets the minimum credit amount that can be extended to a merchant. Controls the lower bound of credit exposure per merchant to prevent non-collectible dust.</td></tr><tr><td><strong>MAX_DRP</strong></td><td>Sets the maximum default risk premium rate that can be charged. Caps the risk premium to prevent excessive costs</td></tr></tbody></table>

#### Market Control Parameters

<table><thead><tr><th width="185.53515625">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><strong>IS_PAUSED</strong></td><td>Controls whether the market is active or paused. Emergency circuit breaker to halt all market operations</td></tr><tr><td><strong>MAX_ON_CREDIT</strong></td><td>Sets the maximum percentage of total supply that can be deployed into the MorphoCredit pool. Controls overall market utilization.</td></tr><tr><td><strong>DEBT_CAP</strong></td><td>Sets the absolute maximum total debt allowed across market. Hard cap on total protocol debt to manage systemic risk.</td></tr></tbody></table>

#### Market Timing Parameters

<table><thead><tr><th width="215.1171875">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><strong>GRACE_PERIOD</strong></td><td>Duration after payment cycle end before delinquency begins. Gives merchants time to make payments after cycle end.</td></tr><tr><td><strong>DELINQUENCY_PERIOD</strong></td><td>Duration of delinquency before default status. Time window for merchants to catch up on payments whilst paying penalty.</td></tr><tr><td><strong>CYCLE_DURATION</strong></td><td>Duration of each payment cycle. Defines the regular payment schedule for merchants.</td></tr><tr><td><strong>MIN_BORROW</strong></td><td>Minimum outstanding loan balance to prevent dust positions. Ensures meaningful amounts to enforce collectibility.</td></tr><tr><td><strong>IRP</strong></td><td>Penalty rate per second for delinquent merchants. Additional interest charged during delinquency period.</td></tr></tbody></table>

#### Interest Rate Model (IRM) Parameters

<table><thead><tr><th width="239.33203125">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><strong>CURVE_STEEPNESS</strong></td><td>Controls how steeply interest rates change with utilization. Higher values create more aggressive rate adjustments.</td></tr><tr><td><strong>ADJUSTMENT_SPEED</strong></td><td>Speed at which rates adjust toward target based on utilization error. Controls how quickly rates respond to market conditions.</td></tr><tr><td><strong>TARGET_UTILIZATION</strong></td><td>Optimal utilization rate where interest rates are at baseline. Reference point for rate adjustments.</td></tr><tr><td><strong>INITIAL_RATE_AT_TARGET</strong></td><td>Baseline interest rate when utilization equals target. Starting point for rate calculations.</td></tr><tr><td><strong>MIN_RATE_AT_TARGET</strong></td><td>Floor for the rate at target utilization. Prevents rates from going too low.</td></tr><tr><td><strong>MAX_RATE_AT_TARGET</strong></td><td>Ceiling for the rate at target utilization. Prevents rates from going too high.</td></tr></tbody></table>

#### USD3 & sUSD3 Tranche Parameters

<table><thead><tr><th width="279.0390625">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><strong>TRANCHE_RATIO</strong></td><td>Maximum subordination ratio for sUSD3 deposits. Controls how much of the total debt can be subordinated to sUSD3 holders.</td></tr><tr><td><strong>TRANCHE_SHARE_VARIANT</strong></td><td>Determines the performance fee structure for sUSD3. Configures how profits are shared between USD3 and sUSD3 holders.</td></tr><tr><td><strong>MIN_SUSD3_BACKING_RATIO</strong></td><td>Minimum percentage of debt that must be backed by sUSD3 assets. Ensures sufficient backing for subordinated debt</td></tr><tr><td><strong>SUSD3_LOCK_DURATION</strong></td><td>Minimum time sUSD3 must be locked before withdrawal. Prevents rapid withdrawal and ensures commitment</td></tr><tr><td><strong>SUSD3_COOLDOWN_PERIOD</strong></td><td>Waiting period after lock expires before withdrawal window opens. Additional time buffer before withdrawals are allowed</td></tr><tr><td><strong>USD3_COMMITMENT_TIME</strong></td><td>Time period for USD3 commitment before deployment. Ensures commitment before funds are deployed</td></tr><tr><td><strong>SUSD3_WITHDRAWAL_WINDOW</strong></td><td>Duration of the withdrawal window after cooldown. Time limit for completing withdrawals.</td></tr><tr><td><strong>USD3_SUPPLY_CAP</strong></td><td>Maximum total supply of USD3 tokens. Controls overall protocol size and risk exposure.</td></tr></tbody></table>

#### Markdown Parameters

<table><thead><tr><th width="280.74609375">Parameters</th><th>Description</th></tr></thead><tbody><tr><td><strong>FULL_MARKDOWN_DURATION</strong></td><td>Time required for 100% markdown of defaulted positions. Controls how quickly defaulted positions are written down</td></tr></tbody></table>

#### Parameter Relationships and Usage

These parameters work together to create a comprehensive risk management system:

1. **Credit Risk Management**: MAX\_LTV, MAX\_VV, MAX\_CREDIT\_LINE, MIN\_CREDIT\_LINE, and MAX\_DRP control individual borrower risk
2. **Market Risk Management**: DEBT\_CAP, MAX\_ON\_CREDIT, and USD3\_SUPPLY\_CAP control overall protocol exposure
3. **Interest Rate Management**: The IRM parameters create an adaptive interest rate system that responds to utilization
4. **Tranche Management**: The USD3/sUSD3 parameters control the subordination structure and withdrawal mechanics
5. **Default Management**: GRACE\_PERIOD, DELINQUENCY\_PERIOD, and FULL\_MARKDOWN\_DURATION control the default and recovery process
6. **Backing Requirements**: MIN\_SUSD3\_BACKING\_RATIO ensures sufficient backing for subordinated debt

All parameters are stored in a single mapping and can be updated by the protocol owner through the `setConfig` function, providing flexibility for protocol evolution while maintaining security through proper access controls.
