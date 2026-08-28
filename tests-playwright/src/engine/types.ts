import type { SummaryJsonField } from 'forms-shared/summary-json/summaryJsonTypes'

/**
 * Which family of control the app rendered for a field.
 *
 * `forms-shared` knows this already — `SummaryXmlForm` puts `type={BaWidgetType}` on every
 * `<field>` element — but `getSummaryJson` drops the attribute when it parses the XML back
 * (`getSummaryJson.tsx:115-125`). Adding it there would change the shape of `SummaryJsonField`,
 * which has committed snapshots in `forms-shared/tests/summary-json/__snapshots__`, so we resolve
 * the kind from the rendered DOM instead. See `resolveWidgetKind`.
 */
export type WidgetKind =
  | 'radio'
  | 'select'
  | 'checkbox'
  | 'checkboxGroup'
  | 'file'
  | 'number'
  | 'date'
  | 'time'
  | 'textarea'
  | 'text'
  | 'unknown'

export type FillOptions = {
  /**
   * Resolves a local file to upload for a file field. The plan's own value is a server-side UUID
   * that does not exist locally, so uploads are the one thing the schema cannot drive.
   */
  files?: (fieldId: string) => string
  /**
   * Maps a file uuid to the name the example gave it (`ExampleForm.serverFiles`). The extension
   * decides which local asset stands in for it, and the name is reused for the upload so multiple
   * files in one field stay distinguishable.
   */
  fileNames?: Record<string, string>
  /**
   * Called when a field held a different value than the plan after being filled. Used by the
   * verify pass to surface app bugs instead of silently papering over them.
   */
  onMismatch?: (field: SummaryJsonField, actual: string, expected: string) => void
}
