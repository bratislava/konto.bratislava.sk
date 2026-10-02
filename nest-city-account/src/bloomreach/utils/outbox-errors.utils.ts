const TERMINAL_DOWNGRADE_SQLSTATE = 'BR001'
const TERMINAL_OVERRIDE_SQLSTATE = 'BR003'
const DUPLICATE_PENDING_CUSTOMER_SQLSTATE = 'BR004'
const DUPLICATE_PENDING_EVENT_SQLSTATE = 'BR005'

function isBloomreachTriggerError(error: unknown, sqlstate: string): boolean {
  const cause = (error as { cause?: { kind?: string; code?: string } } | undefined)?.cause
  return (
    error instanceof Error &&
    error.name === 'DriverAdapterError' &&
    cause?.kind === 'postgres' &&
    cause.code === sqlstate
  )
}

/** A terminal entry was about to be downgraded by an UPDATE - should never happen, investigate. */
export function isTerminalDowngradeError(error: unknown): boolean {
  return isBloomreachTriggerError(error, TERMINAL_DOWNGRADE_SQLSTATE)
}

/** An INSERT was rejected because a terminal entry at least as recent already exists - expected. */
export function isTerminalOverrideError(error: unknown): boolean {
  return isBloomreachTriggerError(error, TERMINAL_OVERRIDE_SQLSTATE)
}

/** Duplicate PENDING customers row - lockTransactionWithKey should have prevented this. */
export function isDuplicatePendingCustomerError(error: unknown): boolean {
  return isBloomreachTriggerError(error, DUPLICATE_PENDING_CUSTOMER_SQLSTATE)
}

/** Duplicate PENDING customers/events row - lockTransactionWithKey should have prevented this. */
export function isDuplicatePendingEventError(error: unknown): boolean {
  return isBloomreachTriggerError(error, DUPLICATE_PENDING_EVENT_SQLSTATE)
}
