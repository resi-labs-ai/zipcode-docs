# Privacy & Storage

## **Bank via Plaid**

**Connection:** upon connecting to your bank, we only store (1) bank balance and (2) an AES-256 encrypted [**asset report token**](https://plaid.com/docs/api/products/assets/#create-an-asset-report) in our database provided to us by Plaid. The asset report token allows us to make an API request to Bank servers to collect PII at a later point in time. You will be able to disconnect at any point via <https://my.plaid.com/> which severs our ability to access to your personal data from Bank servers. This approach strikes a balance between collecting minimal viable personal data whilst maintaining effective collection strategies by outsourcing skip tracing to licensed collections agencies with access to commercial databases via TLOxp. We do NOT have access to Social Security Numbers or Date of Birth.

**Repayment:** a “purge PII” button appears in your dashboard. Pressing it deletes the four fields above and leaves only hashed bank acct + anonymized credit history. You may reconnect Plaid later to reopen a line of credit.

## **Credit Karma via zkTLS**

**Connection:** upon connecting to your credit karma, we store in our database (1) credit scores, credit age, credit utilization, derogatory marks, num. hard inquiries, payment history, and total accounts (non-PII) and (2) a SHA-256 **hash** of your first and last name to ensure the credit data belongs to the bank account. We do NOT store any personally identifiable information (PII) from Credit Karma.

Connecting to credit karma does NOT trigger a hard check on your credit report.

## **Dropbox Signatures**

**Signing Legal Doc:** when we initiate a signing flow, your personal information (such as your name, email, and home address) is passed through in real time by making an API call to Plaid's banking servers on the fly and immediately merged into the Dropbox Sign document template. This process is purely ephemeral. Your details exist only in memory during the request and are never cached, logged, or written to our databases. **No persistence on our servers.**

Because all handling and enrichment occur in transit, our infrastructure never retains your personal data, it is used solely to generate the document at the moment of signing.

The signed legal document is securely stored in an isolated Dropbox repository within Dropbox - this will include your full name, email, phone number, and home address.

You will only have to do this once.

## **Browser**

**Connection:** upon connecting your wallet, we store the IP address for fraud-risk scoring.
