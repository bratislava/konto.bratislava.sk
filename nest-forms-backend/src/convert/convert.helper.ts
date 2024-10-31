import { FormDefinitionSlovenskoSkTax } from 'forms-shared/definitions/formDefinitionTypes'

/**
 * Tax form is a special case, as the only usage of ConvertService in its case is when user imports/exports the XML via
 * user interface. Currently, the form that is sent to NASES has different posp* (than this new one). The tax form will
 * be migrated to the new posp* in the future. In order to provide users the possibility to import the form, the exported
 * XML will already contain the new posp* (after the migration this patch will be removed, but the forms will be importable).
 *
 * Before this patch, the generated XML had the old posp*, but contained the "importable" data shape, not the one that
 * is sent to NASES.
 */
// eslint-disable-next-line import/prefer-default-export
export const patchConvertServiceTaxFormDefinition = (
  formDefinition: FormDefinitionSlovenskoSkTax,
): FormDefinitionSlovenskoSkTax => ({
  ...formDefinition,
  pospID: '00603481.priznanieKDaniZNehnutelnosti',
  pospVersion: '1.0',
})
