import cx from 'classnames'
import React, { createContext, Fragment } from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  pixelBasedPreset,
  Section,
  Tailwind,
  type TailwindConfig,
  Text,
} from 'react-email'

import { FileInfoSummary } from '../form-files/fileStatus'
import { FormSummary } from '../summary/summary'
import {
  SummaryArrayComponentProps,
  SummaryArrayItemComponentProps,
  SummaryFieldComponentProps,
  SummaryFileValueComponentProps,
  SummaryFormComponentProps,
  SummaryInvalidValueComponentProps,
  SummaryNoneValueComponentProps,
  SummaryRenderer,
  SummaryStepComponentProps,
  SummaryStringValueComponentProps,
} from '../summary-renderer/SummaryRenderer'
import { FileIdInfoMap } from './renderSummaryEmail'

/**
 * Email rules this template follows (caniemail.com data, checked in Email on Acid, Outlook 2016):
 * - `pixelBasedPreset`: classic Outlook for Windows ignores `rem`, so every size must be `px`.
 * - Only utilities that can be inlined (no `sm:`, `hover:`, `dark:`): the production email is
 *   rendered without `<html>`/`<head>` (`withHtmlBodyTags: false`) and pasted into a Mailgun
 *   template, so there is no `<head>` to hold a `<style>` block. React Email throws if one is needed.
 * - No padding on `<p>`: Outlook ignores it (the old 8px gap between values disappeared there).
 *   Text spacing uses margins; `Section` puts its own padding on its `<td>`.
 * - No `display: inline-block`, `border-radius` or `white-space` reliance: Outlook ignores all
 *   three, so the pill is a table cell and line breaks are real `<br>`s.
 * - Colors are exact hex tokens: Tailwind 4's default palette is OKLCH and slightly different
 *   from the v3 hex values this email used.
 * - Outlook does not inherit `font-family` into nested tables, so without help the summary falls
 *   back to Times New Roman there. An Outlook-only `<style>` (inside `<!--[if mso]>`, ignored by
 *   every other client) sets the font on the summary's text. Other clients keep inheriting the
 *   host template's font, so they look exactly as before.
 * - Borders use one shorthand declaration (`[border-bottom:…]`) like the original inline style.
 *   `border-b-2 border-solid` would need `border-0` too and emits five longhand declarations.
 *   Dynamic class strings are fine here: React Email runs Tailwind at render time.
 */
const colors = {
  divider: '#e5e7eb',
  pill: '#f3f4f6',
  danger: '#ef4444',
} as const

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors,
      fontFamily: {
        system: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen-Sans',
          'Ubuntu',
          'Cantarell',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
    },
  },
} satisfies TailwindConfig

type SummaryEmailProps = {
  formSummary: FormSummary
  fileInfos: Record<string, FileInfoSummary>
  fileIdInfoMap: FileIdInfoMap
  withHtmlBodyTags: boolean
}

const FileIdInfoMapContext = createContext<FileIdInfoMap | null>(null)

const useFileIdInfoMap = () => {
  const fileIdInfoMap = React.useContext(FileIdInfoMapContext)
  if (!fileIdInfoMap) {
    throw new Error('useFileIdInfoMap must be used within a FileIdInfoMapContext.Provider')
  }

  return fileIdInfoMap
}

/** Value rows: 8px gap below every value except the last one. Margin, not padding (Outlook). */
const valueClassName = (isLast: boolean) => cx('m-0', { 'mb-2': !isLast })

/** `white-space: pre-wrap` is ignored by classic Outlook, so turn newlines into `<br>`. */
const MultilineText = ({ value }: { value: string }) => {
  const lines = value.split(/\r\n|\r|\n/)

  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ))
}

const SUMMARY_CLASS_NAME = 'summary-email'

/**
 * Outlook-only font fix. React can't render HTML comments, hence `dangerouslySetInnerHTML`.
 * It must come before the content: Outlook only applies `<style>` rules declared before use.
 */
const OutlookFontFix = () => (
  <div
    dangerouslySetInnerHTML={{
      __html: `<!--[if mso]><style>.${SUMMARY_CLASS_NAME} p, .${SUMMARY_CLASS_NAME} td, .${SUMMARY_CLASS_NAME} a { font-family: "Segoe UI", Arial, sans-serif; }</style><![endif]-->`,
    }}
  />
)

const FormComponent = ({ children }: SummaryFormComponentProps) => (
  <>
    <OutlookFontFix />
    <Container className={SUMMARY_CLASS_NAME}>{children}</Container>
  </>
)

const StepComponent = ({ step, children, isFirst }: SummaryStepComponentProps) => (
  <Section>
    <Text className={cx('m-0 mb-4 text-[20px] leading-[24px] font-bold', { 'mt-4': !isFirst })}>
      {step.title}
    </Text>
    {children}
  </Section>
)

const FieldComponent = ({ field, children }: SummaryFieldComponentProps) => (
  <Section className={`mb-[10px] pb-[10px] [border-bottom:2px_solid_${colors.divider}]`}>
    <Text className="m-0 font-bold">{field.label}</Text>
    {children}
  </Section>
)

const StringValueComponent = ({ value, isLast }: SummaryStringValueComponentProps) => (
  <Text className={cx(valueClassName(isLast), 'whitespace-pre-wrap')}>
    <MultilineText value={value} />
  </Text>
)

const FileValueComponent = ({ fileInfo, isLast }: SummaryFileValueComponentProps) => {
  const fileIdInfoMap = useFileIdInfoMap()
  const fileUrl = fileIdInfoMap[fileInfo.id]?.url

  return (
    <Text className={valueClassName(isLast)}>
      {fileUrl ? <Link href={fileUrl}>{fileInfo.fileName}</Link> : fileInfo.fileName}
    </Text>
  )
}

const NoneValueComponent = ({ isLast }: SummaryNoneValueComponentProps) => (
  <Text className={valueClassName(isLast)}>-</Text>
)

const InvalidValueComponent = ({ isLast }: SummaryInvalidValueComponentProps) => (
  <Text className={cx(valueClassName(isLast), 'text-danger')}>Neznáma hodnota</Text>
)

const ArrayComponent = ({ array, children }: SummaryArrayComponentProps) => (
  <Section>
    <Text className="m-0 mb-4 font-bold">{array.title}</Text>
    {children}
  </Section>
)

const ArrayItemComponent = ({ arrayItem, children, isLast }: SummaryArrayItemComponentProps) => (
  <Section className={cx(`pl-4 [border-left:2px_solid_${colors.divider}]`, { 'mb-4': !isLast })}>
    {/* Pill: a shrink-to-fit table cell, because Outlook ignores inline-block and padding on <p>.
        Rounded corners show everywhere except classic Outlook, which falls back to square. */}
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} className="mb-2">
      <tbody>
        <tr>
          <td className="bg-pill rounded-[12px] px-2 text-[14px] leading-[24px] font-bold">
            {arrayItem.title}
          </td>
        </tr>
      </tbody>
    </table>
    {children}
  </Section>
)

export const SummaryEmail = ({
  formSummary: { summaryJson },
  fileInfos,
  fileIdInfoMap,
  withHtmlBodyTags,
}: SummaryEmailProps) => {
  const content = (
    <SummaryRenderer
      summaryJson={summaryJson}
      fileInfos={fileInfos}
      components={{
        FormComponent,
        StepComponent,
        FieldComponent,
        ArrayComponent,
        ArrayItemComponent,
        StringValueComponent,
        FileValueComponent,
        NoneValueComponent,
        InvalidValueComponent,
      }}
      validationData={null}
    />
  )

  return (
    <FileIdInfoMapContext.Provider value={fileIdInfoMap}>
      <Tailwind config={tailwindConfig}>
        {withHtmlBodyTags ? (
          // React Email's <Body> defaults to lang="en" on <body> and its <td>, so set it there too.
          <Html lang="sk">
            <Head />
            <Body lang="sk" className="font-system bg-white">
              {content}
            </Body>
          </Html>
        ) : (
          content
        )}
      </Tailwind>
    </FileIdInfoMapContext.Provider>
  )
}
