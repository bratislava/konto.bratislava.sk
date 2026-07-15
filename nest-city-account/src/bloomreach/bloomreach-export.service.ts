import { Injectable } from '@nestjs/common'
import axios, { isAxiosError } from 'axios'

import {
  BloomreachCustomerIdsQuery,
  BloomreachEventNameEnum,
  BloomreachExportCustomerResponseSchema,
  BloomreachExportedCustomer,
  BloomreachExportedEvent,
  BloomreachExportEventsResponseSchema,
} from './bloomreach.types'

@Injectable()
export class BloomreachExportService {
  private readonly bloomreachCredentials = Buffer.from(
    `${process.env.BLOOMREACH_API_KEY}:${process.env.BLOOMREACH_API_SECRET}`,
    'binary'
  ).toString('base64')

  async fetchCustomer(
    customerIds: BloomreachCustomerIdsQuery
  ): Promise<BloomreachExportedCustomer | null> {
    try {
      const response = await axios.post(
        `${process.env.BLOOMREACH_API_URL}/data/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/export-one`,
        { customer_ids: customerIds },
        { headers: { Authorization: `Basic ${this.bloomreachCredentials}` } }
      )

      const body = BloomreachExportCustomerResponseSchema.parse(response.data)
      return body.success && body.value ? body.value : null
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async fetchConsentEvents(
    customerIds: BloomreachCustomerIdsQuery
  ): Promise<BloomreachExportedEvent[]> {
    try {
      const response = await axios.post(
        `${process.env.BLOOMREACH_API_URL}/data/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/events`,
        { customer_ids: customerIds, event_types: [BloomreachEventNameEnum.CONSENT] },
        { headers: { Authorization: `Basic ${this.bloomreachCredentials}` } }
      )

      const body = BloomreachExportEventsResponseSchema.parse(response.data)
      return body.success ? (body.data ?? []) : []
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return []
      }
      throw error
    }
  }
}
