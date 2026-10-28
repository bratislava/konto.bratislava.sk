import cx from 'classnames'
import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import type { FormsBackendFile } from 'forms-shared/form-files/serverFilesTypes'
import type { FormSummary } from 'forms-shared/summary/summary'
import {
  type SummaryArrayComponentProps,
  type SummaryArrayItemComponentProps,
  type SummaryFieldComponentProps,
  type SummaryFileValueComponentProps,
  type SummaryFormComponentProps,
  type SummaryInvalidValueComponentProps,
  type SummaryNoneValueComponentProps,
  SummaryRenderer,
  type SummaryRendererComponents,
  type SummaryStepComponentProps,
  type SummaryStringValueComponentProps,
} from 'forms-shared/summary-renderer/SummaryRenderer'

import { MultilineText } from '../components/MultilineText'
import { TextLink } from '../components/Typography'
import { colors } from '../theme/tokens'
import type { FileIdInfoMap } from './legacy/renderSummaryEmail'

export type FormSummarySectionProps = {
  formSummary: FormSummary
  serverFiles?: FormsBackendFile[]
  /** Download link and name of every uploaded file, by file ID. */
  fileIdInfoMap: FileIdInfoMap
}

/** 8px between the values of one field. Margin, not padding: Outlook ignores padding on `<p>`. */
const valueClassName = (isLast: boolean, extra?: string) =>
  cx('m-0 font-sans text-[14px] leading-[20px]', { 'mb-[8px]': !isLast }, extra)

/**
 * The summary components close over the file map instead of reading it from context: React
 * Email's Tailwind renders them as plain functions, where a provider in the email isn't visible.
 */
const createComponents = (fileIdInfoMap: FileIdInfoMap): SummaryRendererComponents => ({
  FormComponent: ({ children }: SummaryFormComponentProps) => children,
  StepComponent: ({ step, children, isFirst }: SummaryStepComponentProps) => (
    <>
      <h2
        className={cx(
          'ba-text m-0 mb-[16px] font-sans text-[20px] leading-[28px] font-semibold text-ink',
          { 'mt-[32px]': !isFirst },
        )}
      >
        {step.title}
      </h2>
      {children}
    </>
  ),
  FieldComponent: ({ field, children }: SummaryFieldComponentProps) => (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      className="mb-[12px]"
    >
      <tbody>
        <tr>
          <td className={`ba-divider pb-[12px] [border-bottom:1px_solid_${colors.light.divider}]`}>
            <p className="ba-text m-0 mb-[4px] font-sans text-[14px] leading-[20px] font-semibold text-ink">
              {field.label}
            </p>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  ),
  ArrayComponent: ({ array, children }: SummaryArrayComponentProps) => (
    <>
      <p className="ba-text m-0 mb-[12px] font-sans text-[14px] leading-[20px] font-semibold text-ink">
        {array.title}
      </p>
      {children}
    </>
  ),
  ArrayItemComponent: ({ arrayItem, children, isLast }: SummaryArrayItemComponentProps) => (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      className={cx({ 'mb-[16px]': !isLast })}
    >
      <tbody>
        <tr>
          <td className={`ba-divider pl-[16px] [border-left:2px_solid_${colors.light.divider}]`}>
            {/* A shrink-to-fit table cell: Outlook ignores inline-block and padding on <p>. */}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              className="mb-[8px]"
            >
              <tbody>
                <tr>
                  <td className="ba-code ba-text rounded-[12px] bg-code px-[8px] font-sans text-[14px] leading-[24px] font-semibold text-ink">
                    {arrayItem.title}
                  </td>
                </tr>
              </tbody>
            </table>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  ),
  StringValueComponent: ({ value, isLast }: SummaryStringValueComponentProps) => (
    <p className={valueClassName(isLast, 'ba-text text-ink')}>
      <MultilineText value={value} />
    </p>
  ),
  FileValueComponent: ({ fileInfo, isLast }: SummaryFileValueComponentProps) => {
    const url = fileIdInfoMap[fileInfo.id]?.url

    return (
      <p className={valueClassName(isLast, 'ba-text text-ink')}>
        {url ? <TextLink href={url}>{fileInfo.fileName}</TextLink> : fileInfo.fileName}
      </p>
    )
  },
  NoneValueComponent: ({ isLast }: SummaryNoneValueComponentProps) => (
    <p className={valueClassName(isLast, 'ba-text text-ink')}>-</p>
  ),
  InvalidValueComponent: ({ isLast }: SummaryInvalidValueComponentProps) => (
    <p className={valueClassName(isLast, 'ba-error text-error')}>Neznáma hodnota</p>
  ),
})

/** The answers of a submitted form, as staff read them in the new-submission emails. */
export const FormSummarySection = ({
  formSummary,
  serverFiles,
  fileIdInfoMap,
}: FormSummarySectionProps) => (
  <SummaryRenderer
    summaryJson={formSummary.summaryJson}
    fileInfos={mergeClientAndServerFilesSummary([], serverFiles)}
    components={createComponents(fileIdInfoMap)}
    validationData={null}
  />
)
