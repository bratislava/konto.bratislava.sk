import { ConsentEnum } from '@prisma/client'

import { BloomreachConsentActionEnum, BloomreachExportedEvent, Consent } from '../bloomreach.types'
import { maxBy } from 'lodash'

export function consentCategory(consentType: ConsentEnum): string {
  return `ESBS-${consentType}`
}

/**
 * Reduces exported consent events to the latest state per city-account consent
 * category. Categories with no event (never granted nor rejected) are omitted.
 */
export function extractLatestCityAccountConsents(events: BloomreachExportedEvent[]): Consent[] {
  const consents: Consent[] = []

  for (const consentType of Object.values(ConsentEnum)) {
    const category = consentCategory(consentType)
    const eventsInCategory = events.filter((event) => event.properties.category === category)
    const latest = maxBy(eventsInCategory, 'timestamp')

    if (latest) {
      consents.push({
        consentType,
        isGranted: latest.properties.action === BloomreachConsentActionEnum.ACCEPT.toString(),
      })
    }
  }

  return consents
}
