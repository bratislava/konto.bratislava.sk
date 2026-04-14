import { BloomreachCustomerCommandData } from '../bloomreach.types'

export function mergeCustomerCommandData(
  base: BloomreachCustomerCommandData,
  override: BloomreachCustomerCommandData
): BloomreachCustomerCommandData {
  return {
    customer_ids: { ...base.customer_ids, ...override.customer_ids },
    properties: { ...base.properties, ...override.properties },
  }
}
