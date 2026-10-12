// Choices offered in the waitlist modal. Shared by the modal (app/waitlist.tsx)
// and the API route, which accepts only these exact values.

import { VAULTS } from './vaults'

export type Intent = 'borrow' | 'lend'

export const INTENT_LABEL: Record<Intent, string> = {
  borrow: 'Borrowing (building a vault)',
  lend: 'Lending (funding vaults)',
}

/** Borrower: the hardware they want to finance. */
export const HARDWARE = [...VAULTS.map((v) => v.name), 'Another configuration', 'Not sure yet'] as const

/** Lender: which vaults they would fund. */
export const LEND_TARGETS = ['Any open vault', ...VAULTS.map((v) => v.name)] as const

/** Lender: indicative commitment. Optional. */
export const AMOUNTS = ['Under $25,000', '$25,000 – $100,000', '$100,000 – $500,000', '$500,000 or more'] as const

export const NOTES_MAX = 500
