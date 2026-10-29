import { ConsentEnum } from '../../generated/prisma/enums'
import { BloomreachConsentActionEnum, BloomreachExportedEvent, Consent } from '../bloomreach.types'

export function consentCategory(consentType: ConsentEnum): string {
  return `ESBS-${consentType}`
}

const CONSENT_TYPE_BY_CATEGORY = new Map<string, ConsentEnum>(
  Object.values(ConsentEnum).map((consentType) => [consentCategory(consentType), consentType])
)

export function consentTypeFromCategory(category: string): ConsentEnum | undefined {
  return CONSENT_TYPE_BY_CATEGORY.get(category)
}

/**
 * Maps exported Bloomreach consent events to (unreduced) Consent records - one
 * per event, dropping events outside the known city-account categories.
 */
export function eventsToConsents(events: BloomreachExportedEvent[]): Consent[] {
  return events.flatMap((event) => {
    const consentType = consentTypeFromCategory(event.properties.category as string)
    if (!consentType) {
      return []
    }
    return [
      {
        consentType,
        isGranted: event.properties.action === BloomreachConsentActionEnum.ACCEPT.toString(),
        timestamp: event.timestamp,
      },
    ]
  })
}

export function extractLatestCityAccountConsents(consents: Consent[]): Consent[] {
  const latestByType = new Map<ConsentEnum, Consent>()

  for (const consent of consents) {
    const current = latestByType.get(consent.consentType)
    if (!current || (consent.timestamp ?? 0) > (current.timestamp ?? 0)) {
      latestByType.set(consent.consentType, consent)
    }
  }

  return [...latestByType.values()]
}
