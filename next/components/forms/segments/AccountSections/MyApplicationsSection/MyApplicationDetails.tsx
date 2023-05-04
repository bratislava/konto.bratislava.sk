import MyApplicationDetailsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetailsHeader'
import MyApplicationHistory from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationHistory'
import SummaryRow from 'components/forms/steps/Summary/SummaryRow'
import { MyApplicationHistoryDataBase, MyApplicationsSentCardBase } from 'frontend/api/mocks/mocks'
import { useTranslation } from 'next-i18next'

type MyApplicationsDetailsBase = {
  detailsData: MyApplicationsSentCardBase
  historyData: MyApplicationHistoryDataBase[]
}

const MyApplicationDetails = ({ detailsData, historyData }: MyApplicationsDetailsBase) => {
  const { t } = useTranslation('account')
  return (
    <div className="flex flex-col">
      <MyApplicationDetailsHeader data={detailsData} />
      <div className="w-full max-w-screen-lg mx-auto flex flex-col py-12 gap-16">
        <div className="flex flex-col gap-2 px-4 lg:px-0">
          <h3 className="text-h3">
            {t('account_section_applications.details.application_details.title')}
          </h3>
          <div className="w-full flex flex-col">
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.record_number'),
                value: detailsData?.recordNumber,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.file_number'),
                value: detailsData?.fileNumber,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.handle_person'),
                value: detailsData?.handlePerson,
                schemaPath: '',
                isError: false,
              }}
            />
            <SummaryRow
              size="small"
              isEditable={false}
              data={{
                label: t('account_section_applications.details.application_details.contact'),
                value: detailsData?.contact,
                schemaPath: '',
                isError: false,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 lg:px-0">
          <h3 className="text-h3">
            {t('account_section_applications.details.application_history.title')}
          </h3>
          <MyApplicationHistory historyData={historyData} />
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetails
