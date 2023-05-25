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
      <div className="w-full hidden md:flex flex-col gap-4">
        {historyData.map((data, i) => (
          <div key={i} className="border-b-2 md:flex-nowrap flex flex-wrap flex-row py-4 gap-2">
            <div className="flex items-center gap-8">
              <div className="flex flex-col min-w-[276px]">
                <span className="text-p3-semibold">
                  {t('account_section_applications.details.application_history.edit_date')}
                </span>
                <span className="text-p2">{data?.editDate}</span>
              </div>
              <div className="flex flex-col w-full">
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
      <div className=" flex md:hidden flex-col overflow-x-auto">
        <div className="border-2 border-gray-200 rounded-lg w-[548px]">
          <div className="p-4 bg-gray-200 flex items-center">
            <span className="text-p2 min-w-[240px]">
              {t('account_section_applications.details.application_history.edit_date')}
            </span>
            <span className="text-p2 w-full">
              {t('account_section_applications.details.application_history.description')}
            </span>
          </div>
          <div className="flex flex-col items-center">
            {historyData.map((data, i) => (
              <div className="w-full border-t-2 flex p-4" key={i}>
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
