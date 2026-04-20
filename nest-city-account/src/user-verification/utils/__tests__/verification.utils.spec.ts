import { extractBirthNumberFromUri, extractIcoFromUri } from '../utils'

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
})
