import React, { createContext } from 'react'
import { Body, Container, Html, Link, Section, Text } from '@react-email/components'
import {
  SummaryArrayItemRendererProps,
  SummaryArrayRendererProps,
  SummaryFieldRendererProps,
  SummaryFileValueRendererProps,
  SummaryFormRendererProps,
  SummaryInvalidValueRendererProps,
  SummaryNoneValueRendererProps,
  SummaryRenderer,
  SummaryStepRendererProps,
  SummaryStringValueRendererProps,
} from '../summary-renderer/SummaryRenderer'
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes'
import { ValidatedSummary } from '../summary-renderer/validateSummary'
import { RenderSummaryEmailFileIdUrlMap } from './renderSummaryEmail'

type SummaryEmailProps = {
  summaryJson: SummaryJsonForm
  validatedSummary: ValidatedSummary
  fileIdUrlMap: RenderSummaryEmailFileIdUrlMap
  withHtmlBodyTags: boolean
}

const FileIdUrlMapContext = createContext<RenderSummaryEmailFileIdUrlMap | null>(null)

const useFileIdUrlMap = () => {
  const fileIdUrlMap = React.useContext(FileIdUrlMapContext)
  if (!fileIdUrlMap) {
    throw new Error('useFileIdUrlMap must be used within a FileIdUrlMapProvider')
  }

  return fileIdUrlMap
}

const FormRenderer = ({ form, children }: SummaryFormRendererProps) => (
  <Container>{children}</Container>
)

const StepRenderer = ({ step, children, isFirst }: SummaryStepRendererProps) => (
  <Section>
    <Text
      style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginTop: isFirst ? '0' : '16px',
        marginBottom: '16px',
      }}
    >
      {step.title}
    </Text>
    {children}
  </Section>
)

const FieldRenderer = ({ field, children }: SummaryFieldRendererProps) => (
  <Section
    style={{
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '10px',
      marginBottom: '10px',
    }}
  >
    <Text style={{ margin: '0', fontWeight: 'bold' }}>{field.label}</Text>
    {children}
  </Section>
)

const StringValueRenderer = ({ value, isLast }: SummaryStringValueRendererProps) => (
  <Text
    style={{
      margin: '0',
      paddingBottom: isLast ? '0' : '8px',
      whiteSpace: 'pre-wrap',
    }}
  >
    {value}
  </Text>
)

const FileValueRenderer = ({ fileInfo, isLast }: SummaryFileValueRendererProps) => {
  const fileIdUrlMap = useFileIdUrlMap()
  const fileUrl = fileIdUrlMap[fileInfo.id]
  return (
    <Text style={{ margin: '0', paddingBottom: isLast ? '0' : '8px' }}>
      {fileUrl ? <Link href={fileUrl}>{fileInfo.fileName}</Link> : fileInfo.fileName}
    </Text>
  )
}

const NoneValueRenderer = ({ isLast }: SummaryNoneValueRendererProps) => (
  <Text style={{ margin: '0', paddingBottom: isLast ? '0' : '8px' }}>-</Text>
)

const InvalidValueRenderer = ({ isLast }: SummaryInvalidValueRendererProps) => (
  <Text
    style={{
      margin: '0',
      paddingBottom: isLast ? '0' : '8px',
      color: '#ef4444',
    }}
  >
    Neznáma hodnota
  </Text>
)

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => (
  <Section>
    <Text style={{ fontWeight: 'bold', margin: '0 0 16px 0' }}>{array.title}</Text>
    {children}
  </Section>
)

const ArrayItemRenderer = ({ arrayItem, children, isLast }: SummaryArrayItemRendererProps) => (
  <Section
    style={{
      borderLeft: '2px solid #e5e7eb',
      paddingLeft: '16px',
      marginTop: '0',
      marginBottom: isLast ? '0' : '16px',
    }}
  >
    <Text
      style={{
        display: 'inline-block',
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: '0 8px',
        borderRadius: '12px',
        margin: '0 0 8px 0',
      }}
    >
      {arrayItem.title}
    </Text>
    {children}
  </Section>
)

export const SummaryEmail = ({
  summaryJson,
  validatedSummary,
  fileIdUrlMap,
  withHtmlBodyTags,
}: SummaryEmailProps) => {
  const content = (
    <FileIdUrlMapContext.Provider value={fileIdUrlMap}>
      <SummaryRenderer
        summaryJson={summaryJson}
        validatedSummary={validatedSummary}
        renderForm={FormRenderer}
        renderStep={StepRenderer}
        renderField={FieldRenderer}
        renderArray={ArrayRenderer}
        renderArrayItem={ArrayItemRenderer}
        renderStringValue={StringValueRenderer}
        renderFileValue={FileValueRenderer}
        renderNoneValue={NoneValueRenderer}
        renderInvalidValue={InvalidValueRenderer}
      />
    </FileIdUrlMapContext.Provider>
  )

  if (!withHtmlBodyTags) {
    return content
  }

  return (
    <Html>
      <Body
        style={{
          backgroundColor: '#ffffff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        {content}
      </Body>
    </Html>
  )
}
