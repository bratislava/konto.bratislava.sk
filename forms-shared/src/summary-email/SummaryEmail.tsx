import React, { createContext } from 'react'
import { Body, Container, Html, Link, Section, Text } from '@react-email/components'
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
import { FileInfoSummary } from '../form-files/fileStatus'
import { FormSummary } from '../summary/summary'

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

const FormComponent = ({ children }: SummaryFormComponentProps) => <Container>{children}</Container>

const StepComponent = ({ step, children, isFirst }: SummaryStepComponentProps) => (
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

const FieldComponent = ({ field, children }: SummaryFieldComponentProps) => (
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

const StringValueComponent = ({ value, isLast }: SummaryStringValueComponentProps) => (
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

const FileValueComponent = ({ fileInfo, isLast }: SummaryFileValueComponentProps) => {
  const fileIdInfoMap = useFileIdInfoMap()
  const fileUrl = fileIdInfoMap[fileInfo.id].url
  return (
    <Text style={{ margin: '0', paddingBottom: isLast ? '0' : '8px' }}>
      {fileUrl ? <Link href={fileUrl}>{fileInfo.fileName}</Link> : fileInfo.fileName}
    </Text>
  )
}

const NoneValueComponent = ({ isLast }: SummaryNoneValueComponentProps) => (
  <Text style={{ margin: '0', paddingBottom: isLast ? '0' : '8px' }}>-</Text>
)

const InvalidValueComponent = ({ isLast }: SummaryInvalidValueComponentProps) => (
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

const ArrayComponent = ({ array, children }: SummaryArrayComponentProps) => (
  <Section>
    <Text style={{ fontWeight: 'bold', margin: '0 0 16px 0' }}>{array.title}</Text>
    {children}
  </Section>
)

const ArrayItemComponent = ({ arrayItem, children, isLast }: SummaryArrayItemComponentProps) => (
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
  formSummary: { summaryJson },
  fileInfos,
  fileIdInfoMap,
  withHtmlBodyTags,
}: SummaryEmailProps) => {
  const content = (
    <FileIdInfoMapContext.Provider value={fileIdInfoMap}>
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
    </FileIdInfoMapContext.Provider>
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
