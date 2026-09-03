import { Prisma } from '../../generated/prisma/client'
import { BloomreachCustomerCommandData } from '../bloomreach.types'

/** Only anonymization explicitly sets `is_identity_verified` to `false`. */
export function isAnonymizationCommand(command: BloomreachCustomerCommandData): boolean {
  return command.properties.is_identity_verified === false
}

/**
 * Returns true if the existing command should override the incoming command.
 *
 * Terminal always wins over non-terminal regardless of timestamp. Within the same terminal-ness, whichever side actually has the newer
 * timestamp wins.
 */
export function isExistingHigherPriorityEventCommand(
  existing: { isTerminal: boolean; timestamp: number },
  incoming: { isTerminal: boolean; timestamp: number }
): boolean {
  return (
    (existing.isTerminal && !incoming.isTerminal) ||
    (existing.isTerminal === incoming.isTerminal && existing.timestamp > incoming.timestamp)
  )
}

const TERMINAL_OVERRIDE_SQLSTATE = 'BR001'

/**
 * True when `error` is trg_prevent_bloomreach_outbox_terminal_downgrade or
 * trg_prevent_bloomreach_outbox_terminal_override rejecting a write that
 * would have overridden a terminal BloomreachOutbox entry - the
 * database-level backstop for `isExistingHigherPriorityEventCommand`.
 *
 * Verified empirically: with the `@prisma/adapter-pg` driver adapter, a
 * trigger's `RAISE EXCEPTION ... USING ERRCODE = '...'` surfaces as an
 * `Error` named `DriverAdapterError` whose `cause` is
 * `{ kind: 'postgres', code: <SQLSTATE>, ... }` - not as a
 * `Prisma.PrismaClientKnownRequestError`/`PrismaClientUnknownRequestError`.
 */
export function isTerminalOverrideError(error: unknown): boolean {
  const cause = (error as { cause?: { kind?: string; code?: string } } | undefined)?.cause
  return (
    error instanceof Error &&
    error.name === 'DriverAdapterError' &&
    cause?.kind === 'postgres' &&
    cause.code === TERMINAL_OVERRIDE_SQLSTATE
  )
}

/**
 * True when `error` is a violation of one of BloomreachOutbox's dedup
 * partial unique indexes (bloomreach_outbox_customers_pending_key /
 * bloomreach_outbox_events_pending_key) - unlike the terminal-protection
 * triggers, Prisma recognizes this natively as its standard unique-constraint
 * error, verified empirically: `PrismaClientKnownRequestError` with
 * `code: 'P2002'` and `meta.modelName: 'BloomreachOutbox'`.
 *
 * Under normal operation this should never fire - `lockOutboxDedupKey`
 * already serializes concurrent writers for the same key. Seeing it means
 * that locking was bypassed somehow and is worth investigating as a bug.
 */
export function isBloomreachOutboxDedupConflictError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    error.meta?.modelName === 'BloomreachOutbox'
  )
}

export function mergeCustomerCommandData(
  base: BloomreachCustomerCommandData,
  override: BloomreachCustomerCommandData
): BloomreachCustomerCommandData {
  const [older, newer] =
    base.update_timestamp <= override.update_timestamp ? [base, override] : [override, base]

  // An anonymize command is terminal
  if (isAnonymizationCommand(older) || isAnonymizationCommand(newer)) {
    return isAnonymizationCommand(newer) ? newer : older
  }

  return {
    customer_ids: { ...older.customer_ids, ...newer.customer_ids },
    properties: { ...older.properties, ...newer.properties },
    update_timestamp: newer.update_timestamp,
  }
}
