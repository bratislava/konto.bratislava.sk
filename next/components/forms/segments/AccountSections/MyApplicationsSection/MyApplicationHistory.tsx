import { MyApplicationHistoryDataBase } from 'frontend/api/mocks/mocks'
import { useTranslation } from 'next-i18next'

interface MyApplicationHistoryProps {
  historyData: MyApplicationHistoryDataBase[]
}

const MyApplicationHistory = ({ historyData }: MyApplicationHistoryProps) => {
  const { t } = useTranslation('account')
  return (
    <>
      {/* Desktop */}
      <div className="hidden w-full flex-col gap-4 md:flex">
        {historyData.map((data, i) => (
          <div key={i} className="flex flex-row flex-wrap gap-2 border-b-2 py-4 md:flex-nowrap">
            <div className="flex items-center gap-8">
              <div className="flex min-w-[276px] flex-col">
                <span className="text-p3-semibold">
                  {t('account_section_applications.details.application_history.edit_date')}
                </span>
                <span className="text-p2">{data?.editDate}</span>
              </div>
              <div className="flex w-full flex-col">
                <span className="text-p3-semibold">
                  {t('account_section_applications.details.application_history.description')}
                </span>
                <span className="text-p2">{data?.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className=" flex flex-col overflow-x-auto md:hidden">
        <div className="w-[548px] rounded-lg border-2 border-gray-200">
          <div className="flex items-center bg-gray-200 p-4">
            <span className="text-p2 min-w-[240px]">
              {t('account_section_applications.details.application_history.edit_date')}
            </span>
            <span className="text-p2 w-full">
              {t('account_section_applications.details.application_history.description')}
            </span>
          </div>
          <div className="flex flex-col items-center">
            {historyData.map((data, i) => (
              <div className="flex w-full border-t-2 p-4" key={i}>
                <span className="text-p2 min-w-[240px]">{data?.editDate}</span>
                <span className="text-p2 w-full">{data?.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default MyApplicationHistory
