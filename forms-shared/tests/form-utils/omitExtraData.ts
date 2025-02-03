import { describe, test, expect, beforeEach } from 'vitest'
import { omitExtraData } from '../../src/form-utils/omitExtraData'
import priznanieKDaniZNehnutelnosti from '../../src/schemas/priznanieKDaniZNehnutelnosti'
import { filterConsole } from '../../test-utils/filterConsole'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { input } from '../../src/generator/functions/input'
import { object } from '../../src/generator/object'

describe('omitExtraData', () => {
  beforeEach(() => {
    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )
  })

  test('should omit extra data for simple schema', () => {
    const { schema } = object('wrapper', {}, {}, [
      input('input', { type: 'text', title: 'Input title' }, {}),
    ])

    const result = omitExtraData(
      schema,
      {
        input: 'value',
        extraField: 'extra value',
      },
      testValidatorRegistry,
    )
    expect(result).toEqual({ input: 'value' })
  })

  // "Údaje o daňovníkovi" step in "Priznanie k dani z nehnuteľnosti" contains a lot of conditional fields, the original
  // data consists of all possible fields, therefore it is a good test case for omitting extra data.
  test('should omit extra data for complex schema', () => {
    const result = omitExtraData(
      priznanieKDaniZNehnutelnosti,
      {
        udajeODanovnikovi: {
          voSvojomMene: true,
          priznanieAko: 'fyzickaOsoba',
          obecPsc: {
            psc: '82108',
            obec: 'Bratislava',
          },
          stat: '703',
          menoTitul: {
            meno: 'Ján',
            titul: 'Ing.',
          },
          ulicaCisloFyzickaOsoba: {
            cislo: '12',
            ulica: 'Mierová',
          },
          korespondencnaAdresa: {
            korespondencnaAdresaRovnaka: false,
            ulicaCisloKorespondencnaAdresa: {
              cislo: '34',
              ulica: 'Dunajská',
            },
            obecPsc: {
              psc: '82109',
              obec: 'Bratislava',
            },
            stat: '703',
          },
          opravnenaOsoba: {
            splnomocnenie: [],
            splnomocnenecTyp: 'fyzickaOsoba',
            obecPsc: {
              obec: 'Bratislava',
              psc: '82108',
            },
            stat: '703',
            menoTitul: {
              meno: 'Peter',
              titul: 'Mgr.',
            },
            ulicaCisloFyzickaOsoba: {
              ulica: 'Šancová',
              cislo: '56',
            },
            ulicaCisloPravnickaOsoba: {
              ulica: 'Karadžičova',
              cislo: '8',
            },
            priezvisko: 'Horváth',
            email: 'peter.horvath@priklad.sk',
            telefon: '+421902345678',
            obchodneMenoAleboNazov: 'Peter Horváth Consulting',
          },
          ulicaCisloPravnickaOsoba: {
            ulica: 'Karadžičova',
            cislo: '8',
          },
          ulicaCisloFyzickaOsobaPodnikatel: {
            ulica: 'Šancová',
            cislo: '56',
          },
          email: 'jan.novak@priklad.sk',
          telefon: '+421905123456',
          priezvisko: 'Novák',
          rodneCislo: '8501011234',
          ico: '12345678',
          obchodneMenoAleboNazov: 'Novák Consulting',
          pravnyVztahKPO: 'statutarnyZastupca',
          pravnaForma: '113',
        },
      },
      testValidatorRegistry,
    )

    expect(result).toEqual({
      udajeODanovnikovi: {
        email: 'jan.novak@priklad.sk',
        korespondencnaAdresa: {
          korespondencnaAdresaRovnaka: false,
          obecPsc: {
            obec: 'Bratislava',
            psc: '82109',
          },
          stat: '703',
          ulicaCisloKorespondencnaAdresa: {
            cislo: '34',
            ulica: 'Dunajská',
          },
        },
        menoTitul: {
          meno: 'Ján',
          titul: 'Ing.',
        },
        obecPsc: {
          obec: 'Bratislava',
          psc: '82108',
        },
        priezvisko: 'Novák',
        priznanieAko: 'fyzickaOsoba',
        rodneCislo: '8501011234',
        stat: '703',
        telefon: '+421905123456',
        ulicaCisloFyzickaOsoba: {
          cislo: '12',
          ulica: 'Mierová',
        },
        voSvojomMene: true,
      },
    })
  })

  getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} should not contain extra data`, () => {
      const result = omitExtraData(
        formDefinition.schema,
        exampleForm.formData,
        testValidatorRegistry,
      )
      expect(result).toEqual(exampleForm.formData)
    })
  })
})
