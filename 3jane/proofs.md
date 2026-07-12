# Proofs

## zkTLS Proofs

3Jane uses Reclaim protocol, which leverages the zkTLS proxy model, in order to fetch and prove the\
integrity of HTTPS responses of a user’s VantageScore 3.0 score via Credit Karma, CEX assets, and Bank cash & other cash flows via Plaid, without introducing additional trust assumptions on the user or the protocol itself. Furthermore, 3Jane utilizes EigenLayer’s cryptoeconomic security to ensure a collusion resistant set of designated verifiers that scales with credit line sizes. Proofs will be posted onchain by the credit underwriting module alongside the corresponding data, giving depositors the ability to audit the health of the merchant pool. This is critical for 3Jane’s architecture for two reasons:

1. Extracting offchain credit data: traditionally, in order to access a user’s credit data the\
   merchant must (1) provide their social security number (SSN) and (2) the merchant must be on-boarded with 1-2 of the major credit bureaus, after which point the lender uses your SSN to do a hard check with the credit bureaus to receive your credit report. 3Jane avoids collecting SSN’s and hard checks entirely by leveraging zkTLS to trustlessly and privately extract your credit data directly from your Credit Karma account upon log in without introducing additional trust\
   assumptions onto the user
2. Selective disclosure of offchain balances: in order to maximize the auditability of the\
   merchant pool by creditors, 3Jane leverages zkTLS to make onchain proofs about some statement on the API response, in particular whether the CEX and bank balance is greater than or equal to some floor Vf

> Zero-knowledge TLS (zkTLS) allows one to obtain and prove the provenance of arbitrary HTTPS traffic, and without revealing personal identifiable information associated with that HTTPS session.

## zkCoprocessor Proofs

3Jane leverages Lagrange protocol’s zero-knowledge coprocessor (zkCoprocessor) to prove arbitrary current or historical state of any EVM chain pertaining to an address, ensuring onchain failsafes for credit underwriting and turning away flagged sybils, fraud, or uncreditworthy users on the smart contract level.
