import {
  getEvaluatedStepsSchemas,
  getEvaluatedStepsSchemasLegacy,
  getStepProperty,
} from '../../src/form-utils/steps'
import { conditionalStep, input, radioGroup, schema, step } from '../../src/generator/functions'
import { createCondition } from '../../src/generator/helpers'
import priznanieKDaniZNehnutelnosti from '../../src/schemas/priznanieKDaniZNehnutelnosti'

type TestSchema = {
  name: string
  schema: ReturnType<typeof schema>
  cases: {
    name: string
    formData: Record<string, unknown>
    expectedProperties: (string | null)[]
  }[]
}

describe('getEvaluatedStepsSchemas', () => {
  const testSchemas: TestSchema[] = [
    {
      name: 'Empty schema without steps',
      schema: schema({ title: 'Test schema' }, {}, []),
      cases: [
        {
          name: 'Empty form data',
          formData: {},
          expectedProperties: [],
        },
      ],
    },
    {
      name: 'Regular steps without conditions',
      schema: schema({ title: 'Test schema' }, {}, [
        step('basicInfo', { title: 'Basic Info' }, [
          input('name', { title: 'Name', type: 'text', required: true }, {}),
        ]),
        step('contact', { title: 'Contact' }, [
          input('email', { title: 'Email', type: 'email', required: true }, {}),
        ]),
      ]),
      cases: [
        {
          name: 'Empty form data',
          formData: {},
          expectedProperties: ['basicInfo', 'contact'],
        },
      ],
    },
    {
      name: 'Conditional steps schema',
      schema: schema({ title: 'Test schema' }, {}, [
        step('step1', { title: 'Step 1' }, [
          radioGroup(
            'hasCompany',
            {
              type: 'boolean',
              title: 'Do you have a company?',
              required: true,
              options: [
                { value: true, title: 'Yes' },
                { value: false, title: 'No' },
              ],
            },
            { variant: 'boxed' },
          ),
        ]),
        conditionalStep(
          'step2',
          createCondition([[['step1', 'hasCompany'], { const: true }]]),
          { title: 'Company Information' },
          [
            input('companyName', { title: 'Company Name', type: 'text', required: true }, {}),
            input('ico', { title: 'ICO', type: 'text', required: true }, {}),
          ],
        ),
      ]),
      cases: [
        {
          name: 'Condition met',
          formData: { step1: { hasCompany: true } },
          expectedProperties: ['step1', 'step2'],
        },
        {
          name: 'Condition not met',
          formData: { step1: { hasCompany: false } },
          expectedProperties: ['step1', null],
        },
      ],
    },
    {
      name: 'Priznanie k dani z nehnutelnosti schema',
      schema: priznanieKDaniZNehnutelnosti,
      cases: [
        {
          name: 'With spouse step',
          formData: {
            danZPozemkov: {
              vyplnitObject: {
                vyplnit: true,
              },
              priznania: [
                {
                  spoluvlastnictvo: 'bezpodieloveSpoluvlastnictvoManzelov',
                },
              ],
            },
          },
          expectedProperties: [
            'druhPriznania',
            'udajeODanovnikovi',
            'danZPozemkov',
            'danZoStaviebJedenUcel',
            'danZoStaviebViacereUcely',
            'danZBytovANebytovychPriestorov',
            'bezpodieloveSpoluvlastnictvoManzelov',
            'znizenieAleboOslobodenieOdDane',
          ],
        },
        {
          name: 'Without spouse step',
          formData: {
            danZPozemkov: {
              vyplnitObject: {
                vyplnit: true,
              },
              priznania: [
                {
                  spoluvlastnictvo: 'podieloveSpoluvlastnictvo',
                },
              ],
            },
          },
          expectedProperties: [
            'druhPriznania',
            'udajeODanovnikovi',
            'danZPozemkov',
            'danZoStaviebJedenUcel',
            'danZoStaviebViacereUcely',
            'danZBytovANebytovychPriestorov',
            null,
            'znizenieAleboOslobodenieOdDane',
          ],
        },
      ],
    },
  ]

  testSchemas.forEach(({ name: schemaName, schema: testSchema, cases }) => {
    describe(schemaName, () => {
      test.each(cases)('$name', ({ formData, expectedProperties }) => {
        const evaluated = getEvaluatedStepsSchemas(testSchema.schema, formData)
        const actualProperties = evaluated.map(getStepProperty)
        expect(actualProperties).toEqual(expectedProperties)
      })

      test.each(cases)('Legacy comparison - $name', ({ formData }) => {
        const evaluated = getEvaluatedStepsSchemas(testSchema.schema, formData)
        const evaluatedLegacy = getEvaluatedStepsSchemasLegacy(testSchema.schema, formData)
        expect(evaluated).toEqual(evaluatedLegacy)
      })
    })
  })
})
