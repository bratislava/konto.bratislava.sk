import path from 'node:path'

import { getExampleFormPairs } from 'forms-shared/example-forms/getExampleFormPairs'
import { createSingleUseValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { getFormSummary } from 'forms-shared/summary/summary'

/**
 * Form summaries for the examples of the form emails, computed from forms-shared's example forms.
 * They are stored as JSON because the preview can't bundle the summary computation (forms-shared
 * builds summaries with jsdom). `generate-form-summary-fixtures.ts` writes them; a test checks they
 * still match forms-shared.
 */
export const formSummaryFixtureSources = {
  'olo-kolo-taxi': 'oloKoloTaxiExample',
  'nahlasenie-podnetu-k-elektrickym-kolobezkam': 'nahlaseniePodnetuKElektrickymKolobezkamExample',
  'zavazne-stanovisko-k-investicnej-cinnosti': 'zavazneStanoviskoKInvesticnejCinnostiExample',
} as const

export const formSummaryFixturesDirectory = path.join(
  import.meta.dirname,
  '..',
  'src',
  'emails',
  'forms',
  'fixtures',
)

/** The fixture as JSON would store it (no `undefined`, dates as strings). */
export const computeFormSummaryFixture = (exampleName: string): unknown => {
  const pair = getExampleFormPairs().find(({ exampleForm }) => exampleForm.name === exampleName)
  if (!pair) {
    throw new Error(`forms-shared has no example form named ${exampleName}.`)
  }
  const serverFiles = pair.exampleForm.serverFiles ?? []

  return JSON.parse(
    JSON.stringify({
      formSummary: getFormSummary({
        formDefinition: pair.formDefinition,
        formDataJson: pair.exampleForm.formData,
        validatorRegistry: createSingleUseValidatorRegistry(),
      }),
      serverFiles,
      fileIdInfoMap: Object.fromEntries(
        serverFiles.map((file) => [
          file.id,
          { url: `https://example.com/files/${file.id}`, fileName: file.fileName },
        ]),
      ),
    }),
  )
}
