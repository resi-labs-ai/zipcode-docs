# Liquidity

USD3 and sUSD3 fund credit assets that are longer-dated than instant redemption, while suppliers can request redemptions sooner. This page sets out that liquidity profile and the tools that manage it.

## Redemption

* **USD3** redeems up to the tranche ratio.
* **sUSD3** has a 1-month lock, then a cooldown and withdrawal window.

See [Suppliers](/usd3-susd3/suppliers.md) for the full tranche mechanics.

## Liquidity tools

* **Cash buffer.** Idle USDC is held in Aave and is instantly available for redemptions.
* **Self-liquidating assets.** The underlying receivables are short-duration — principal and interest return continuously as loans amortize, steadily refilling available cash.
* **Secondary markets.** USD3 / sUSD3 can be traded to exit ahead of primary redemption.
* **Committed liquidity facilities (roadmap).** On-demand liquidity facilities — the role liquidity enhancement plays in a traditional ABCP conduit — layered on top of the cash buffer and secondary markets.

The cash buffer introduces some yield drag, which $JANE incentives are sized to offset.
