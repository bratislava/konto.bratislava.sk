import { ChevronLeftIcon } from '@assets/ui-icons'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'

type TaxFeeSectionHeaderProps = {
  title: string
}
const TaxFeeSectionHeader = ({ title }: TaxFeeSectionHeaderProps) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  return (
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-(--breakpoint-lg) flex-col gap-4 py-6">
        <div className="flex cursor-pointer items-center gap-0.5">
          {/* TODO: navigation 2025 */}
          <div className="flex size-5 items-center justify-center">
            <ChevronLeftIcon className="size-5" />
          </div>
          <button
            type="button"
            className="text-p3-medium underline underline-offset-2"
            onClick={() => router.push(ROUTES.TAXES_AND_FEES)}
          >
            {t('back_to_list')}
          </button>
        </div>
        <div className="flex size-full flex-col items-start gap-2">
          <div className="flex size-full flex-col items-start gap-4">
            <div className="flex w-full flex-row items-center gap-4">
              <div className="grow text-h1">{title}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
