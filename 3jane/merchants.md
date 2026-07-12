# Merchants

All **U.S.-based** merchants can permissionlessly access 0% collateral USDC credit lines in real-time\
within two minutes. The connection flow is as follows:

1. **Wallet connection:** Merchant connects any EOA or smart account and signs a nonce, proving address control and anchoring subsequent data to a single on-chain identity.
2. **Bank account connection via Plaid:** OAuth-style login authorizes Plaid to supply real-time balances, 90-day cash-flow, and account history metrics. Data is fetched through a zkTLS relay (zkFetch) that provides a proof of provenance without disclosing raw PII on-chain.
3. **Credit Karma connection:** User logs into credit karma via zkTLS. 3Jane retrieves credit data from TransUnion and Equifax, including credit scores and other metadata.
4. **MCA agreement signature:** The merchant electronically signs the Merchant Cash Advance (MCA) clause, establishing legal recourse and payment terms under U.S. law. Agreement is visibile here: <https://drive.google.com/file/d/1oVYpnAI4L82_tLI-TT92RsnLZHepZr8O/view?usp=sharing>.
5. **Instant drawdown:** The merchant selects any amount up to the approved credit limit and receives USDC in the wallet. Only pay for what you've drawn.

Read the [credit underwriter](/backing/ccl/credit-underwriter.md) section for more details on how it impacts credit lines and interest rates.

Read the [guide](/backing/ccl/pull-credit-line.md) for how to connect offchain Credit Karma and Bank data.

{% hint style="info" %}
Note: All off-chain data are attested with zkTLS; raw PII remains off-chain. Implementation details are in [Proofs](/backing/ccl/proofs.md) and [Privacy & Storage](/backing/ccl/privacy-and-storage.md).
{% endhint %}

<figure><img src="/files/OkzXlNYewmpEKUWjIQxk" alt=""><figcaption></figcaption></figure>
