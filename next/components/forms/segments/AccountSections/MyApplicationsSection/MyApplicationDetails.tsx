import MyApplicationDetailsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetailsHeader'
import MyApplicationHistory from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationHistory'
import SummaryRowSimple from 'components/forms/simple-components/SummaryRowSimple'
import SummaryRow from 'components/forms/steps/Summary/SummaryRow'
import { useTranslation } from 'next-i18next'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import MLinkNew from '../../../simple-components/MLinkNew'

type MyApplicationsDetailsBase = {
  formDefinitionTitle: string
  detailsData: GetFormResponseDto
  ginisData: GinisDocumentDetailResponseDto | null
}

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
      <div className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-16 py-12">
        <div className="flex flex-col gap-2 px-4 lg:px-0">
          <h3 className="text-h3">
            {t('account_section_applications.details.application_details.title')}
          </h3>
          <div className="flex w-full flex-col">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.record_number'),
                value: ginisData?.id,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.file_number'),
                value: ginisData?.dossierId,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.handle_person'),
                value: ginisData?.ownerName,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRowSimple
              size="small"
              isEditable={false}
              label={t('account_section_applications.details.application_details.contact')}
              isError={false}
            >
              <p>
                {ginisData?.ownerPhone ? (
                  <MLinkNew variant="underlined" href={`tel:${ginisData.ownerPhone}`}>
                    {`${ginisData.ownerPhone}, `}
                  </MLinkNew>
                ) : (
                  ''
                )}
                {ginisData?.ownerEmail ? (
                  <MLinkNew variant="underlined" href={`mailto:${ginisData.ownerEmail}`}>
                    {ginisData.ownerEmail}
                  </MLinkNew>
                ) : (
                  t('account_section_applications.details.application_details.email_unavailable')
                )}
              </p>
            </SummaryRowSimple>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 lg:px-0">
          <h3 className="text-h3">
            {t('account_section_applications.details.application_history.title')}
          </h3>
          <MyApplicationHistory historyData={ginisData?.documentHistory} />
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetails
