import escapeXml from '../xml'

describe('xml.ts', () => {
  describe('escapeXml', () => {
    it('should correctly escape the text', () => {
      const input = 'Test & Test s.r.o, and < " \' >'
      const expected = 'Test &amp; Test s.r.o, and &lt; &quot; &apos; &gt;'

      const result = escapeXml(input)
      expect(result).toBe(expected)
    })

    it('should keep the text as it is', () => {
      const input = 'Test and Test s.r.o, no more text... :)'
      const expected = 'Test and Test s.r.o, no more text... :)'

      const result = escapeXml(input)
      expect(result).toBe(expected)
    })
  })
})
