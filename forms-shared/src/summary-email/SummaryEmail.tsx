import React, { createContext } from 'react'
import { Body, Container, Html, Link, Row, Section, Text } from '@react-email/components'
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
        fontWeight: '600',
        marginTop: isFirst ? '0px' : '16px',
        marginBottom: '16px',
      }}
    >
      {step.title}
    </Text>
    {children}
  </Section>
)

const FieldRenderer = ({ field, children }: SummaryFieldRendererProps) => (
  <Row
    style={{
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '10px',
      marginBottom: '10px',
    }}
  >
    <Text style={{ margin: '0px', fontWeight: '600' }}>{field.label}</Text>
    {children}
  </Row>
)

const StringValueRenderer = ({ value, isLast }: SummaryStringValueRendererProps) => {
  return (
    <Text
      style={{
        marginTop: '0px',
        marginBottom: isLast ? '0px' : '8px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {value}
    </Text>
  )
}

const FileValueRenderer = ({ fileInfo, isLast }: SummaryFileValueRendererProps) => {
  const fileIdUrlMap = useFileIdUrlMap()
  const fileUrl = fileIdUrlMap[fileInfo.id]
  const content = fileUrl ? (
    <Link href={fileUrl}>{fileInfo.fileName}</Link>
  ) : (
    <>{fileInfo.fileName}</>
  )

  return <Text style={{ marginTop: '0px', marginBottom: isLast ? '0px' : '8px' }}>{content}</Text>
}

const NoneValueRenderer = ({ isLast }: SummaryNoneValueRendererProps) => (
  <Text style={{ marginTop: '0px', marginBottom: isLast ? '0px' : '8px' }}>-</Text>
)

const InvalidValueRenderer = ({ isLast }: SummaryInvalidValueRendererProps) => (
  <Text style={{ marginTop: '0px', marginBottom: isLast ? '0px' : '8px', color: '#ef4444' }}>
    Neznáma hodnota
  </Text>
)

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => (
  <>
    <Text style={{ fontWeight: '600', marginTop: '0px', marginBottom: '16px' }}>{array.title}</Text>
    {children}
  </>
)

const ArrayItemRenderer = ({ arrayItem, children, isLast }: SummaryArrayItemRendererProps) => (
  <Section
    style={{
      borderLeft: '2px solid #e5e7eb',
      paddingLeft: '16px',
      marginTop: '0px',
      marginBottom: isLast ? '0px' : '16px',
    }}
  >
    <Text
      style={{
        display: 'inline-block',
        fontWeight: '600',
        backgroundColor: '#f3f4f6',
        padding: '0px 8px',
        borderRadius: '12px',
        marginTop: '0px',
        marginBottom: '8px',
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
}: SummaryEmailProps) => {
  return (
    <Html>
      <Body
        style={{
          backgroundColor: '#ffffff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
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
      </Body>
    </Html>
  )
}
