# Banking Rail (Erebor)

FCCs settle in dollars: warehouse advances and whole-loan purchases wire out in USD, and repayments come back in USD. 3Jane runs that dollar leg through **Erebor**, an API-first, nationally chartered U.S. bank serving crypto-native businesses.

Erebor's API lets 3Jane treat the entire dollar side of the protocol — offramp, disbursement, collection, onramp — as software, tightly integrated with stablecoin rails: the same auditability as the rest of the protocol, the same speed, and no human-in-the-loop for routine operations.

<figure><img src="/files/Z4dMZJRXOFykvKT8tR5e" alt="3Jane x Erebor flow of funds"><figcaption><p>USDC in, USD out to the originator, USD repayments back, yield onramped to USD3 / sUSD3.</p></figcaption></figure>

## Flow of funds

1. **Staging offramps.** Capital deposited into 3Jane is converted from stablecoin to USD and parked in 3Jane's Erebor account.
2. **Funding facilities.** When an originator draws on a facility — a warehouse advance against new originations, a whole-loan purchase from a back-book sale, or a forward-flow takedown — the wire goes out from Erebor to the originator's account.
3. **Cash collection.** Interest on warehouse lines and principal-plus-interest on whole-loan purchases comes back into the same account via ACH or wire.
4. **Onramping yield.** Collected interest is converted back to stablecoins and distributed onchain to USD3 and sUSD3 holders.

{% hint style="info" %}
**Staging is a transitional state.** Capital that has been raised and off-ramped but not yet wired into a facility sits in Erebor "staging." It is already committed but not yet earning facility yield. As wires clear and servicer reports update, staged capital moves into deployed facility principal. 3Jane surfaces staged vs deployed capital on the [Backing](/backing/backing.md) page.
{% endhint %}
