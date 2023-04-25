import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import ExportIcon from '@assets/images/new-icons/ui/export.svg'
import { ROUTES } from '@utils/constants'
import { MyApplicationsConceptCardBase } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsConceptList'
import Button from 'components/forms/simple-components/Button'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const MyApplicationsConceptCard = (props: MyApplicationsConceptCardBase) => {
  const { title, subtitle, category, createDate } = props
  const { t } = useTranslation('account')
  const router = useRouter()

  return (
    <>
      {/* Desktop */}
      <div
        id="desktop-card"
        className="rounded-lg bg-white w-full h-[124px] lg:flex hidden items-center justify-between border-2 border-gray-200"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex flex-col gap-1 pl-6">
            <span className="text-p3-semibold text-main-700">{category}</span>
            <span className="text-20-semibold">{title}</span>
            <span className="text-p3">{subtitle}</span>
          </div>
          <div className="w-full justify-end flex items-center gap-6">
            <div className="flex flex-col w-full max-w-[200px]">
              <span className="text-16-semibold mb-1">
                {t('account_section_applications.navigation_concept_card.createDate')}
              </span>
              <span className="w-max">{createDate}</span>
            </div>
          </div>
          <div className="flex gap-4 mr-6">
            <Button
              variant="black-outline"
              text={t('account_section_applications.navigation_concept_card.button_text')}
              endIcon={<ExportIcon />}
              onPress={() => router.push(`${ROUTES.MY_APPLICATIONS}/1`)}
            />
            <Button variant="black-outline" icon={<DownloadIcon />} />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="bg-white w-full h-[88px] max-[389px]:h-[92px] flex lg:hidden items-center justify-between border-b-2 border-gray-200"
      >
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/1`}
          className="w-full h-full items-center flex justify-center"
        >
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col w-full max-[389px]:gap-1">
              <div className="flex items-center justify-between">
                <span className="text-p3-semibold max-[389px]:max-w-[220px] text-main-700">
                  {category}
                </span>
              </div>
              <span className="text-p2-semibold leading-5 max-[389px]:max-w-[220px]">{title}</span>
            </div>
          </div>
        </Link>
      </div>
    </>
  )
}

export default MyApplicationsConceptCard
