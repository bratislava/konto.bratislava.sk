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
    kind: newer.kind,
    customer_ids: { ...older.customer_ids, ...newer.customer_ids },
    properties: { ...older.properties, ...newer.properties },
    update_timestamp: newer.update_timestamp,
  }
}
