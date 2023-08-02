import MyApplicationDetailsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetailsHeader'
import MyApplicationHistory from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationHistory'
import SummaryRowSimple from 'components/forms/simple-components/SummaryRowSimple'
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
      <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-16 py-12">
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
            <SummaryRowSimple size="small" isEditable={false} label={t('contact')} isError={false}>
              <div className="flex gap-2">
                <div>
                  <a
                    className="underline underline-offset-4"
                    href={`tel:${detailsData?.phoneContact}`}
                  >
                    {detailsData?.phoneContact}
                  </a>
                  ,
                </div>
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${detailsData?.mailContact}`}
                >
                  {detailsData?.mailContact}
                </a>
              </div>
            </SummaryRowSimple>
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
