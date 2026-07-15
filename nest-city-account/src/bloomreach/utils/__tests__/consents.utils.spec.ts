import { ConsentEnum } from '@prisma/client'

import { BloomreachEventNameEnum, BloomreachExportedEvent } from '../../bloomreach.types'
import { consentCategory, extractLatestCityAccountConsents } from '../consents.utils'

describe('consents.utils', () => {
  describe('consentCategory', () => {
    it('should prefix the consent type with ESBS-', () => {
      const consentTypes = ['MARKETING', 'GENERAL', 'SOME_FUTURE_CONSENT', 'x', '123']

      for (const consentType of consentTypes) {
        expect(consentCategory(consentType as ConsentEnum)).toMatch(/^ESBS-/)
      }
    })
  })

  describe('extractLatestConsents', () => {
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
      expect(extractLatestCityAccountConsents([])).toEqual([])
    })

    it('should reduce each category to its latest event', () => {
      const result = extractLatestCityAccountConsents([
        consentEvent('ESBS-MARKETING', 'accept', 100),
        consentEvent('ESBS-MARKETING', 'reject', 300),
        consentEvent('ESBS-MARKETING', 'accept', 200),
        consentEvent('ESBS-GENERAL', 'reject', 100),
        consentEvent('ESBS-GENERAL', 'accept', 200),
      ])

      expect(result).toEqual([
        { consentType: ConsentEnum.MARKETING, isGranted: false },
        { consentType: ConsentEnum.GENERAL, isGranted: true },
      ])
    })

    it('should omit categories without events', () => {
      const result = extractLatestCityAccountConsents([consentEvent('ESBS-GENERAL', 'accept', 100)])

      expect(result).toEqual([{ consentType: ConsentEnum.GENERAL, isGranted: true }])
    })

    it('should ignore categories not belonging to city account', () => {
      const result = extractLatestCityAccountConsents([
        consentEvent('parkdots-marketing', 'accept', 100),
        consentEvent('MARKETING', 'accept', 100),
      ])

      expect(result).toEqual([])
    })
  })
})
