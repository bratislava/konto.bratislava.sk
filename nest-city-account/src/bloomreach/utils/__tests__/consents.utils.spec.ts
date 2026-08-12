import { ConsentEnum } from '../../../generated/prisma/client'
import { BloomreachEventNameEnum, BloomreachExportedEvent } from '../../bloomreach.types'
import {
  consentCategory,
  consentTypeFromCategory,
  eventsToConsents,
  extractLatestCityAccountConsents,
} from '../consents.utils'

describe('consents.utils', () => {
  describe('consentCategory', () => {
    it('should prefix the consent type with ESBS-', () => {
      const consentTypes = ['MARKETING', 'GENERAL', 'SOME_FUTURE_CONSENT', 'x', '123']

      for (const consentType of consentTypes) {
        expect(consentCategory(consentType as ConsentEnum)).toMatch(/^ESBS-/)
      }
    })
  })

  describe('consentTypeFromCategory', () => {
    it('should resolve a known category back to its consent type', () => {
      expect(consentTypeFromCategory('ESBS-MARKETING')).toBe(ConsentEnum.MARKETING)
      expect(consentTypeFromCategory('ESBS-GENERAL')).toBe(ConsentEnum.GENERAL)
    })

    it('should return undefined for a category not belonging to city account', () => {
      expect(consentTypeFromCategory('parkdots-marketing')).toBeUndefined()
      expect(consentTypeFromCategory('MARKETING')).toBeUndefined()
    })
  })

  describe('eventsToConsents', () => {
    const consentEvent = (
      category: string,
      action: string,
      timestamp: number
    ): BloomreachExportedEvent => ({
      type: BloomreachEventNameEnum.CONSENT,
      timestamp,
      properties: { category, action, valid_until: 'unlimited' },
    })

    it('should return empty array for no events', () => {
      expect(eventsToConsents([])).toEqual([])
    })

    it('should map every event to a Consent record, unreduced', () => {
      const result = eventsToConsents([
        consentEvent('ESBS-MARKETING', 'accept', 100),
        consentEvent('ESBS-MARKETING', 'reject', 300),
        consentEvent('ESBS-GENERAL', 'accept', 200),
      ])

      expect(result).toEqual([
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 100 },
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 300 },
        { consentType: ConsentEnum.GENERAL, isGranted: true, timestamp: 200 },
      ])
    })

    it('should drop events for categories not belonging to city account', () => {
      const result = eventsToConsents([
        consentEvent('parkdots-marketing', 'accept', 100),
        consentEvent('MARKETING', 'accept', 100),
      ])

      expect(result).toEqual([])
    })
  })

  describe('extractLatestCityAccountConsents', () => {
    it('should return empty array for no consents', () => {
      expect(extractLatestCityAccountConsents([])).toEqual([])
    })

    it('should reduce each category to its latest consent', () => {
      const result = extractLatestCityAccountConsents([
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 100 },
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 300 },
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 200 },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: 100 },
        { consentType: ConsentEnum.GENERAL, isGranted: true, timestamp: 200 },
      ])

      expect(result).toEqual([
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 300 },
        { consentType: ConsentEnum.GENERAL, isGranted: true, timestamp: 200 },
      ])
    })

    it('should omit categories without any consent', () => {
      const result = extractLatestCityAccountConsents([
        { consentType: ConsentEnum.GENERAL, isGranted: true, timestamp: 100 },
      ])

      expect(result).toEqual([
        { consentType: ConsentEnum.GENERAL, isGranted: true, timestamp: 100 },
      ])
    })

    it('should reduce consents from multiple sources together, keeping the latest per category', () => {
      const fromExport = [{ consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 100 }]
      const fromPending = [{ consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 500 }]

      const result = extractLatestCityAccountConsents([...fromExport, ...fromPending])

      expect(result).toEqual([
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 500 },
      ])
    })
  })
})
