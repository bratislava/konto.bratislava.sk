import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { LabelValueRowProps } from '@/src/components/common/LabelValueRowGroup/LabelValueRow'
import LabelValueRowGroup from '@/src/components/common/LabelValueRowGroup/LabelValueRowGroup'
import { formatDate } from '@/src/components/formatting/FormatDate'
import { formatMarkdownLink } from '@/src/components/formatting/formatMarkdownLink'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import MyApplicationDetailsHeader from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetailsHeader'

type Props = {
  formDefinitionTitle: string
  myApplicationFormData: GetFormResponseDto
  myApplicationGinisData: GinisDocumentDetailResponseDto | null
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationDetails = ({
  formDefinitionTitle,
  myApplicationFormData,
  myApplicationGinisData,
}: Props) => {
  const { t } = useTranslation()

  const { id, dossierId, ownerName, ownerEmail, ownerPhone, documentHistory } =
    myApplicationGinisData ?? {}

  const detailsRows: LabelValueRowProps[] = [
    { label: t('MyApplicationDetails.recordNumber'), value: id },
    // TODO Add 'Názov projektu' when more information is availible from product (we will display this only for some forms)
    { label: t('MyApplicationDetails.fileNumber'), value: dossierId },
    { label: t('MyApplicationDetails.ownerName'), value: ownerName },
    {
      label: t('MyApplicationDetails.ownerContact'),
      valueAsMarkdown: true,
      value: [
        formatMarkdownLink({ value: ownerPhone, type: 'telephone' }),
        formatMarkdownLink({ value: ownerEmail, type: 'email' }),
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ].filter((row) => Boolean(row.value))

  /**
   * TODO History is broken, check with BE
   * - history data needs changes in process and on BE
   * - until then, we just take 1 instance and present it as 'document created'
   *   (all the instances are interpreted as document created)
   * - fix the types in OpenAPI (BE)
   */
  const historyLabelMap = {
    DOCUMENT_CREATED: t('MyApplicationHistory.states.DOCUMENT_CREATED'),
    UNKNOWN: t('MyApplicationHistory.states.UNKNOWN'),
  }

  const historyRows: LabelValueRowProps[] =
    documentHistory?.slice(-1).map((row) => ({
      label: formatDate(row['Datum-zmeny']),
      value: historyLabelMap[row.assignedCategory],
    })) ?? []

  return (
    <div className="flex flex-col">
      <MyApplicationDetailsHeader
        formDefinitionTitle={formDefinitionTitle}
        myApplicationFormData={myApplicationFormData}
        myApplicationGinisData={myApplicationGinisData}
      />
      <SectionContainer className="py-6 lg:pt-8 lg:pb-18">
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-2 lg:gap-4">
            <SectionHeader title={t('MyApplicationDetails.detailsTitle')} />
            <LabelValueRowGroup rows={detailsRows} />
          </div>
          <div className="flex flex-col gap-2 lg:gap-4">
            <SectionHeader title={t('MyApplicationDetails.historyTitle')} />
            <LabelValueRowGroup rows={historyRows} />
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}

export default MyApplicationDetails
