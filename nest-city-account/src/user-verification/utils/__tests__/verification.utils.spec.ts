import {
  extractBirthNumberFromUri,
  extractIcoFromUri,
  resolveEidBirthNumber,
  resolveEidIco,
} from '../utils'

describe('Check utils', () => {
  describe('extractIcoFromUri', () => {
    it('should return ico from URI', () => {
      const uri = 'ico://sk/01234567'
      const ico = extractIcoFromUri(uri)
      expect(ico).toEqual('01234567')
    })
  })

  describe('extractBirthNumberFromUri', () => {
    it('should return birthNumber from URI', () => {
      const uri = 'rc://sk/0001011234_tisici_janko'
      const birthNumber = extractBirthNumberFromUri(uri)
      expect(birthNumber).toEqual('0001011234')
    })
  })

  describe('resolveEidBirthNumber', () => {
    const actorUri = 'rc://sk/8314451337_tisici_janko'

    it.each([
      [
        'SAML Actor.PCO when it matches the URI',
        '8314451337',
        actorUri,
        { outcome: 'resolved', value: '8314451337', source: 'saml' },
      ],
      [
        'SAML with slash vs URI without',
        '831445/1337',
        actorUri,
        { outcome: 'resolved', value: '831445/1337', source: 'saml' },
      ],
      [
        'URI when PCO is missing',
        undefined,
        actorUri,
        { outcome: 'resolved', value: '8314451337', source: 'uri' },
      ],
      [
        'URI when PCO is empty',
        '  ',
        actorUri,
        { outcome: 'resolved', value: '8314451337', source: 'uri' },
      ],
      [
        'SAML when URI has no birth number',
        '8314451337',
        '',
        { outcome: 'resolved', value: '8314451337', source: 'saml' },
      ],
      ['mismatch when they differ', '1111111111', actorUri, { outcome: 'mismatch' }],
      ['missing when neither is present', undefined, '', { outcome: 'missing' }],
    ])('%s', (_, pco, uri, expected) => {
      expect(resolveEidBirthNumber(pco, uri)).toEqual(expected)
    })
  })

  describe('resolveEidIco', () => {
    it.each([
      [
        'SAML Subject.ICO when it matches the URI',
        '12345678',
        'ico://sk/12345678',
        { outcome: 'resolved', value: '12345678', source: 'saml' },
      ],
      [
        'URI when Subject.ICO is missing',
        undefined,
        'ico://sk/12345678',
        { outcome: 'resolved', value: '12345678', source: 'uri' },
      ],
      [
        'URI when Subject.ICO is empty',
        '',
        'ico://sk/12345678',
        { outcome: 'resolved', value: '12345678', source: 'uri' },
      ],
      [
        'suffixed URI for an org unit of the SAML IČO',
        '00603481',
        'ico://sk/00603481_10001',
        { outcome: 'resolved', value: '00603481_10001', source: 'uri' },
      ],
      ['mismatch when they differ', '87654321', 'ico://sk/12345678', { outcome: 'mismatch' }],
      [
        'mismatch when only a prefix matches without suffix separator',
        '1234567',
        'ico://sk/12345678',
        { outcome: 'mismatch' },
      ],
      ['missing when neither is present', undefined, '', { outcome: 'missing' }],
    ])('%s', (_, subjectIco, uri, expected) => {
      expect(resolveEidIco(subjectIco, uri)).toEqual(expected)
    })
  })
})
