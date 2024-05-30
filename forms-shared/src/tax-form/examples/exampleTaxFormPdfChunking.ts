import { TaxFormData } from '../types'
import range from 'lodash/range'

export const exampleTaxFormPdfChunking = {
  danZPozemkov: {
    vyplnitObject: { vyplnit: true },
    priznania: [
      {
        pozemky: [
          {
            parcelneCisloSposobVyuzitiaPozemku: {
              cisloParcely: '1',
            },
          },
        ],
        poznamka: 'Priznanie without chunking',
      },
      {
        pozemky: range(50).map((_, index) => ({
          parcelneCisloSposobVyuzitiaPozemku: {
            cisloParcely: `${index + 1}`,
          },
        })),
        poznamka: 'Priznanie with chunking',
      },
    ],
  },
  danZBytovANebytovychPriestorov: {
    vyplnitObject: { vyplnit: true },
    priznania: [
      {
        priznanieZaNebytovyPriestor: {
          priznanieZaNebytovyPriestor: true,
          nebytovePriestory: [
            {
              riadok: { cisloNebytovehoPriestoruVBytovomDome: '1' },
            },
          ],
        },
        poznamka: 'Priznanie without chunking',
      },
      {
        priznanieZaNebytovyPriestor: {
          priznanieZaNebytovyPriestor: true,
          nebytovePriestory: range(50).map((_, index) => ({
            riadok: { cisloNebytovehoPriestoruVBytovomDome: `${index + 1}` },
          })),
        },
        poznamka: 'Priznanie with chunking',
      },
    ],
  },
} satisfies TaxFormData
