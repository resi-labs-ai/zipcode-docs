// GPU-loan vault model + the three illustrative vaults on the landing.
//
// The protocol in one line: a borrower builds a vault for a specific hardware
// purchase and deposits half the price; lenders fill the other half; the
// loan is fixed-rate and amortizes monthly; the hardware sits in Zipcode
// custody until it is repaid. Every number on the landing derives from the
// constants below so the page can never contradict itself.

export const TERMS = {
  /** Fixed APR, as a fraction. */
  apr: 0.1,
  /** Share of the purchase price the borrower funds up front. */
  borrowerShare: 0.5,
  /** Loan term in months. */
  termMonths: 36,
} as const

export type VaultStatus = 'open' | 'filling' | 'funded'

export type Vault = {
  /** URL-safe id, also the card anchor. */
  id: string
  /** Hardware line, e.g. "4× RTX PRO 6000". */
  name: string
  /** Vendor / family line under the name. */
  family: string
  /** Workstation or datacenter class — the explore filter. */
  klass: 'workstation' | 'datacenter'
  /** Total purchase price in USD (illustrative, rounded market estimate). */
  price: number
  /** Share of the lender side already filled, 0–1 (illustrative). */
  lenderFill: number
  /** One-line spec for the card. */
  spec: string
  /** Aggregate memory, for the spec row. */
  memory: string
  status: VaultStatus
}

export const VAULTS: Vault[] = [
  {
    id: 'rtx-pro-6000-x4',
    name: '4× RTX PRO 6000',
    family: 'NVIDIA Blackwell · workstation',
    klass: 'workstation',
    price: 36_000,
    lenderFill: 0.62,
    spec: '4 × 96 GB GDDR7',
    memory: '384 GB',
    status: 'filling',
  },
  {
    id: 'h200-x8',
    name: '8× H200',
    family: 'NVIDIA HGX H200 · datacenter',
    klass: 'datacenter',
    price: 280_000,
    lenderFill: 0.35,
    spec: '8 × 141 GB HBM3e',
    memory: '1.1 TB',
    status: 'filling',
  },
  {
    id: 'hgx-b300-x2',
    name: '2× HGX B300',
    family: 'NVIDIA Blackwell Ultra · datacenter',
    klass: 'datacenter',
    price: 900_000,
    lenderFill: 0.1,
    spec: '16 × 288 GB HBM3e',
    memory: '4.6 TB',
    status: 'open',
  },
]

/** Standard amortizing payment: P·r / (1 − (1+r)^−n). */
export function monthlyPayment(principal: number, apr = TERMS.apr, months = TERMS.termMonths) {
  const r = apr / 12
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function vaultMath(v: Vault) {
  const borrower = v.price * TERMS.borrowerShare
  const loan = v.price - borrower
  const payment = monthlyPayment(loan)
  const totalRepaid = payment * TERMS.termMonths
  const interest = totalRepaid - loan
  const filled = loan * v.lenderFill
  return { borrower, loan, payment, totalRepaid, interest, filled, remaining: loan - filled }
}

export const usd = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...opts,
  }).format(n)

/** $36K / $280K / $1.2M style. */
export const usdShort = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: n >= 1_000_000 ? 1 : 0,
  }).format(n)

export const pct = (f: number, digits = 0) => `${(f * 100).toFixed(digits)}%`

/** Totals for the protocol-overview strip. */
export function overview(vaults = VAULTS) {
  const m = vaults.map(vaultMath)
  return {
    vaults: vaults.length,
    hardware: vaults.reduce((s, v) => s + v.price, 0),
    lenderSide: m.reduce((s, x) => s + x.loan, 0),
    filled: m.reduce((s, x) => s + x.filled, 0),
  }
}
