# Addresses

### Smart Contracts (Ethereum Mainnet)

| Contract           | Info                                                                                   | Address                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| USD3               | Senior tranche. Yearn Strategy, inherits ERC-4626                                      | [0x056B269Eb1f75477a8666ae8C7fE01b64dD55eCc](https://etherscan.io/address/0x056B269Eb1f75477a8666ae8C7fE01b64dD55eCc#code) |
| sUSD3              | Junior tranche. Yearn Strategy, inherits ERC-4626                                      | [0xf689555121e529ff0463e191f9bd9d1e496164a7](https://etherscan.io/address/0xf689555121e529ff0463e191f9bd9d1e496164a7#code) |
| Helper             | Helper for USD3/sUSD3 deposits and credit lines draws. Wraps/unwraps between waETHUSDC | [0x82736F81A56935c8429ADdbDa4aEBec737444505](https://etherscan.io/address/0x82736F81A56935c8429ADdbDa4aEBec737444505#code) |
| MorphoCredit       | Core money market logic. Augmentation of Morpho Blue.                                  | [0xDe6e08ac208088cc62812Ba30608D852c6B0EcBc](https://etherscan.io/address/0xDe6e08ac208088cc62812Ba30608D852c6B0EcBc#code) |
| ProtocolConfig     | Configuration for core money market parameters.                                        | [0x6b276A2A7dd8b629adBA8A06AD6573d01C84f34E](https://etherscan.io/address/0x6b276A2A7dd8b629adBA8A06AD6573d01C84f34E#code) |
| AdaptiveCurveIRM   | Interest Rate Curve for the pool.                                                      | [0x1d434D2899f81F3C3fdf52C814A6E23318f9C7Df](https://etherscan.io/address/0x1d434D2899f81F3C3fdf52C814A6E23318f9C7Df#code) |
| CreditLine         | Manager for setting user credit lines.                                                 | [0x26389b03298BA5DA0664FfD6bF78cF3A7820c6A9](https://etherscan.io/address/0x26389b03298BA5DA0664FfD6bF78cF3A7820c6A9#code) |
| MarkdownController | Manager for marking down defaulted credit lines.                                       | [0xF0eaE71092F3c9411A9EAb8F81E7d91D29726214](https://etherscan.io/address/0xF0eaE71092F3c9411A9EAb8F81E7d91D29726214#code) |
| InsuranceFund      | Insurance fund for pool backstop.                                                      | [0x4507B5B23340D248457d955a211C8B0634D29935](https://etherscan.io/address/0x4507B5B23340D248457d955a211C8B0634D29935#code) |
| JANE               | Jane Token                                                                             | [0x333333330522f64ee8d0b3039c460b41670e3404](https://etherscan.io/address/0x333333330522f64ee8d0b3039c460b41670e3404#code) |
| RewardsDistributor | Distributor of $JANE rewards                                                           | [0xaC6985D4dBcd89CCAD71DB9bf0309eaF57F064e8](https://etherscan.io/address/0xaC6985D4dBcd89CCAD71DB9bf0309eaF57F064e8#code) |

### Permissions

| Role               | Info  | Address                                                                                                                    |
| ------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| TimelockController | Admin | [0x1dCcD4628d48a50C1A7adEA3848bcC869f08f8C2](https://etherscan.io/address/0x1dCcD4628d48a50C1A7adEA3848bcC869f08f8C2#code) |
| Multisig           | Owner | [0x33333333Bd7045F1A601A1E289D7AB21036fB5EF](https://etherscan.io/address/0x33333333Bd7045F1A601A1E289D7AB21036fB5EF#code) |

Repository: <https://github.com/3jane-protocol/moneymarket-contracts>

{% embed url="<https://github.com/3jane-protocol/moneymarket-contracts>" %}
