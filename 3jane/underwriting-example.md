# Underwriting Example

Let’s walk through a real-life example of a borrower requesting a credit line. The user holds the following positions:

* Locked position on Base: 5,000 [AERO](https://x.com/AerodromeFi) tokens locked until 2028/11/29
* Staked position on Hypercore: 500 HYPE tokens staked on [Hyperliquid](https://x.com/HyperliquidX)
* Borrow/lend positions on HyperEVM and Plasma:
  * On [Hyperlend](https://x.com/hyperlendx):
    * Supplying 5,156 HYPE, 3,080 [kHYPE](https://x.com/kinetiq_xyz) and 1,237 PT-kHYPE
    * Borrowing 2,000 HYPE
  * On [Euler](https://x.com/eulerfinance):
    * Supplying 1,000,000 [USDai](https://x.com/USDai_Official)
    * Borrowing 900,000 [USDT0](https://x.com/USDT0_to)
* Lending vault position: 5.3 WETH on the [Re7](https://x.com/Re7Labs) Morpho vault on Ethereum Mainnet
* LP position on HyperEVM: Supplied concentrated liquidity on [ProjectX](https://x.com/prjx_hl) for the pair WHYPE/USDT0.

The current value of the portfolio is $512,425, as of 28th of October 2025.

The Value-at-Risk at 1% is -34.58%, and the Expected Shortfall at 1% is -39.19%.

The initial weight contributions are:

* Project X LP position: 0.3%
* Aave leveraged lending position: 32.7%
* Hyperlend lending position: 58.1%
* Staked HYPE position: 3.9%
* Morpho vault position: 3.4%
* Locked AERO position: 1.6%

Assuming a credit score of 777, this user would be approved for a credit line of $90,000 at 10% implied APR.
