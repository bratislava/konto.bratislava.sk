import { parseUriNameFromRfo } from '../uri'

describe('Uri', () => {
  it('should return null for no first name', () => {
    const result = parseUriNameFromRfo({
      priezviskaOsoby: [
        {meno: 'Priezvisko', poradiePriezviska: 1}
      ],
    })
    expect(result).toBeNull()
  })

  it('should return null for no last name', () => {
    const result = parseUriNameFromRfo({
      menaOsoby: [
        {meno: 'Meno', poradieMena: 1}
      ],
    })
    expect(result).toBeNull()
  })

  it('should parse single name and surname', () => {
    const result = parseUriNameFromRfo({
      menaOsoby: [
        {meno: 'Jožko', poradieMena: 1}
      ],
      priezviskaOsoby: [
        {meno: 'Mrkvička', poradiePriezviska: 1}
      ]
    })

    expect(result).toBe('mrkvicka_jozko')
  })

  it('should correctly sort', () => {
    const result = parseUriNameFromRfo({
      menaOsoby: [
        {meno: 'Jožko', poradieMena: 1},
        {meno: 'Sevas', poradieMena: 3}
      ],
      priezviskaOsoby: [
        {meno: 'Veľký', poradiePriezviska: 2},
        {meno: 'Mrkvička', poradiePriezviska: 1}
      ]
    })

    expect(result).toBe('mrkvickavelky_jozkosevas')
  })

  it('should correctly sort for missing order', () => {
    const result = parseUriNameFromRfo({
      menaOsoby: [
        {meno: 'Jožko', poradieMena: 1},
        {meno: 'Sevas', poradieMena: 3},
        {meno: 'PRVEMENO'},
      ],
      priezviskaOsoby: [
        {meno: 'Veľký', poradiePriezviska: 2},
        {meno: 'Mrkvička', poradiePriezviska: 1},
        {meno: 'PRVEPRIEZVISKO'}
      ]
    })

    expect(result).toBe('prvepriezviskomrkvickavelky_prvemenojozkosevas')
  })
})
