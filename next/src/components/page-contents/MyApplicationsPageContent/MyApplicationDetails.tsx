import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import SummaryRow from '@/src/components/forms/steps/Summary/SummaryRow'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import MyApplicationDetailsHeader from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetailsHeader'
import MyApplicationHistory from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationHistory'
import MLink from '@/src/components/simple-components/MLink'
import SummaryRowSimple from '@/src/components/simple-components/SummaryRowSimple'

type MyApplicationsDetailsBase = {
  formDefinitionTitle: string
  detailsData: GetFormResponseDto
  ginisData: GinisDocumentDetailResponseDto | null
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationDetails = ({
  formDefinitionTitle,
  detailsData,
  ginisData,
}: MyApplicationsDetailsBase) => {
  const { t } = useTranslation('account')

  return (
    <div className="flex flex-col">
      <MyApplicationDetailsHeader
        formDefinitionTitle={formDefinitionTitle}
        data={detailsData}
        ginisData={ginisData}
      />
      <SectionContainer className="py-12">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-2 px-4 lg:px-0">
            <Typography variant="h3">{t('MyApplicationDetails.title')}</Typography>
            <div className="flex w-full flex-col">
              <SummaryRow
                size="small"
                isEditable={false}
                data={{
                  label: t('MyApplicationDetails.recordNumber'),
                  value: ginisData?.id,
                  schemaPath: '',
                  isError: false,
                }}
              />
              <SummaryRow
                size="small"
                isEditable={false}
                data={{
                  label: t('MyApplicationDetails.fileNumber'),
                  value: ginisData?.dossierId,
                  schemaPath: '',
                  isError: false,
                }}
              />
              <SummaryRow
                size="small"
                isEditable={false}
                data={{
                  label: t('MyApplicationDetails.handlePerson'),
                  value: ginisData?.ownerName,
                  schemaPath: '',
                  isError: false,
                }}
              />
              <SummaryRowSimple
                size="small"
                isEditable={false}
                label={t('MyApplicationDetails.contact')}
                isError={false}
              >
                <Typography variant="p-default">
                  {ginisData?.ownerPhone ? (
                    <MLink variant="underlined" href={`tel:${ginisData.ownerPhone}`}>
                      {`${ginisData.ownerPhone}, `}
                    </MLink>
                  ) : (
                    ''
                  )}
                  {ginisData?.ownerEmail ? (
                    <MLink variant="underlined" href={`mailto:${ginisData.ownerEmail}`}>
                      {ginisData.ownerEmail}
                    </MLink>
                  ) : (
                    t('MyApplicationDetails.emailUnavailable')
                  )}
                </Typography>
              </SummaryRowSimple>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-4 lg:px-0">
            <Typography variant="h3">{t('MyApplicationDetails.historyTitle')}</Typography>
            <MyApplicationHistory historyData={ginisData?.documentHistory} />
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}

export default MyApplicationDetails
