import { GenericObjectType } from '@rjsf/utils'
import FormatDate from 'components/forms/simple-components/FormatDate'
import { useTranslation } from 'next-i18next'
import { GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

interface MyApplicationHistoryProps {
  // TODO fix the types in OpenAPI (BE)
  historyData: GinisDocumentDetailResponseDto['documentHistory'] | undefined
}

const MyApplicationHistory = ({ historyData }: MyApplicationHistoryProps) => {
  const { t } = useTranslation('account')
  return (
    <>
      {/* Desktop */}
      <div className="hidden w-full flex-col gap-4 md:flex">
        {/* TODO - history data needs changes in process and on BE - until then, we just take 1 instance and present it as 'document created' (all the instances are interpreted as document created) */}
        {/* TODO - fix the types in OpenAPI (BE) */}
        {historyData?.slice(-1).map((data: GenericObjectType, i) => (
          <div key={i} className="flex flex-row flex-wrap gap-2 border-b-2 py-4 md:flex-nowrap">
            <div className="flex items-center gap-8">
              <div className="flex min-w-[276px] flex-col">
                <span className="text-p3-semibold">
                  {t('account_section_applications.details.application_history.edit_date')}
                </span>
                <span className="text-p2">
                  <FormatDate>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    {data?.['Datum-zmeny']}
                  </FormatDate>
                </span>
              </div>
              <div className="flex w-full flex-col">
                <span className="text-p3-semibold">
                  {t('account_section_applications.details.application_history.description')}
                </span>
                <span className="text-p2">
                  {t(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `account_section_applications.details.application_history.state.${data?.assignedCategory}`,
                    'account_section_applications.details.application_history.state.UNKNOWN',
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className="flex flex-col overflow-x-auto md:hidden">
        <div className="w-[548px] rounded-lg border-2 border-gray-200">
          <div className="flex items-center bg-gray-200 p-4">
            <span className="min-w-[240px] text-p2">
              {t('account_section_applications.details.application_history.edit_date')}
            </span>
            <span className="w-full text-p2">
              {t('account_section_applications.details.application_history.description')}
            </span>
          </div>
          <div className="flex flex-col items-center">
            {historyData?.map((data: GenericObjectType, i) => (
              <div className="flex w-full border-t-2 p-4" key={i}>
                <span className="min-w-[240px] text-p2">
                  <FormatDate>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    {data?.['Datum-zmeny']}
                  </FormatDate>
                </span>
                <span className="w-full text-p2">
                  {t(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `account_section_applications.details.application_history.state.${data?.assignedCategory}`,
                    'account_section_applications.details.application_history.state.UNKNOWN',
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default MyApplicationHistory
