import { ChevronLeftIcon, DownloadIcon } from '@assets/ui-icons'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import Button from '../../simple-components/Button'
import { useTaxFeeSection } from '../AccountSections/TaxesFeesSection/useTaxFeeSection'

const TaxFeeSectionHeader = () => {
  const { taxData, downloadPdf } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType
  const isSinglePayment = taxData.overallAmount === taxData.overallBalance

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
              <div className="grow text-h1">
                {paymentMethodParam === PaymentMethod.Installments &&
                  t('tax_detail_section.title_payment_installments')}
                {paymentMethodParam === PaymentMethod.RemainingAmount &&
                  !isSinglePayment &&
                  t('tax_detail_section.title_payment_rest')}
                {paymentMethodParam === PaymentMethod.RemainingAmount &&
                  isSinglePayment &&
                  t('tax_detail_section.title_payment_all')}
              </div>

              {/* depends if we provide pdf export right now we don't */}
              {/* {taxData.pdfExport && (
                <Button
                  startIcon={<DownloadIcon className="size-5" />}
                  variant="black-outline"
                  text={t('download_pdf')}
                  size="sm"
                  className="hidden md:block"
                  onPress={downloadPdf}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
