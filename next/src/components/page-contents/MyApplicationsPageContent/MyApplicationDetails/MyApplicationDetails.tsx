import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { LabelValueRowProps } from '@/src/components/common/LabelValueRowGroup/LabelValueRow'
import LabelValueRowGroup from '@/src/components/common/LabelValueRowGroup/LabelValueRowGroup'
import { formatDate } from '@/src/components/formatting/FormatDate'
import { formatMarkdownLink } from '@/src/components/formatting/formatMarkdownLink'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import MyApplicationDetailsHeader from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails/MyApplicationDetailsHeader'

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

  const { id, referenceNumber, dossierId, ownerName, ownerEmail, ownerPhone } =
    myApplicationGinisData ?? {}

  const detailsRows: LabelValueRowProps[] = [
    { label: t('MyApplicationDetails.recordReferenceNumber'), value: referenceNumber },
    { label: t('MyApplicationDetails.recordIdentifier'), value: id },
    // TODO Add 'Názov projektu' when more information is available from product (we will display this only for some forms)
    { label: t('MyApplicationDetails.fileIdentifier'), value: dossierId },
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

  // For now, the only history entry we show is the date the form was sent
  const { formSentAt } = myApplicationFormData
  const historyRows: LabelValueRowProps[] = formSentAt
    ? [
        {
          label: formatDate(formSentAt),
          value: t('MyApplicationDetails.sent'),
        },
      ]
    : []

  return (
    <div className="flex flex-col">
      <MyApplicationDetailsHeader
        formDefinitionTitle={formDefinitionTitle}
        myApplicationFormData={myApplicationFormData}
      />
      <SectionContainer className="py-6 lg:pt-8 lg:pb-18">
        <div className="flex flex-col gap-6 lg:gap-8">
          {detailsRows.length > 0 ? (
            <div className="flex flex-col gap-2 lg:gap-4">
              <SectionHeader title={t('MyApplicationDetails.detailsTitle')} />
              <LabelValueRowGroup rows={detailsRows} />
            </div>
          ) : null}
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
