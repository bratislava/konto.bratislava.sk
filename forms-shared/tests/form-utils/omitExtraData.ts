import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { baOmitExtraData } from '../../src/form-utils/omitExtraData'
import { conditionalFields } from '../../src/generator/functions/conditionalFields'
import { input } from '../../src/generator/functions/input'
import { createCondition } from '../../src/generator/helpers'
import { object } from '../../src/generator/object'
import priznanieKDaniZNehnutelnosti from '../../src/schemas/priznanieKDaniZNehnutelnosti'
import { filterConsole } from '../../test-utils/filterConsole'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('omitExtraData', () => {
  beforeEach(() => {
    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should omit extra data for simple schema', () => {
    const { schema } = object('wrapper', {}, [
      input('input', { type: 'text', title: 'Input title' }, {}),
    ])

    const result = baOmitExtraData(
      schema,
      {
        input: 'value',
        extraField: 'extra value',
      },
      testValidatorRegistry,
    )
    expect(result).toEqual({ input: 'value' })
  })

  // `@x0k/json-schema-merge` 1.0.6 attached the `else` of the second condition to the `if` of the first one, so the
  // stale `ico` was kept. Fixed in 1.1.0, forced by the override in pnpm-workspace.yaml.
  test('should omit data of an inactive else branch that follows a condition without else', () => {
    const { schema } = object('wrapper', {}, [
      input('typ', { type: 'text', title: 'Typ', required: true }, {}),
      conditionalFields(createCondition([[['typ'], { const: 'existujuci' }]]), [
        input('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
      ]),
      conditionalFields(
        createCondition([[['typ'], { const: 'zmena' }]]),
        [input('noveIco', { type: 'text', title: 'Nové IČO', required: true }, {})],
        [input('ico', { type: 'text', title: 'IČO', required: true }, {})],
      ),
    ])

    const result = baOmitExtraData(
      schema,
      { typ: 'zmena', noveIco: '22222222', ico: '11111111' },
      testValidatorRegistry,
    )
    expect(result).toEqual({ typ: 'zmena', noveIco: '22222222' })
  })

  // "Údaje o daňovníkovi" step in "Priznanie k dani z nehnuteľnosti" contains a lot of conditional fields, the original
  // data consists of all possible fields, therefore it is a good test case for omitting extra data.
  test('should omit extra data for complex schema', () => {
    const result = baOmitExtraData(
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
      const result = baOmitExtraData(
        formDefinition.schema,
        exampleForm.formData,
        testValidatorRegistry,
      )
      expect(result).toEqual(exampleForm.formData)
    })
  })
})
