import { ChevronLeftIcon, DownloadIcon } from '@assets/ui-icons'
import { TaxPaidStatusEnum } from '@clients/openapi-tax'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import {
  FormatCurrencyFromCents,
  useCurrencyFromCentsFormatter,
} from '../../../../frontend/utils/formatCurrency'
import { formatDate } from '../../../../frontend/utils/general'
import Button from '../../simple-components/Button'
import TaxPaidStatus from '../AccountSections/TaxesFeesSection/TaxPaidStatus'
import { useTaxFeeSection } from '../AccountSections/TaxesFeesSection/useTaxFeeSection'

const TaxFeeSectionHeader = () => {
  const { taxData, downloadPdf } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const router = useRouter()

  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()

  return (
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-(--breakpoint-lg) flex-col gap-4 py-6">
        <div className="flex cursor-pointer items-center gap-0.5">
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
              <div className="text-h1 grow">
                {t('tax_detail_section.title', { year: taxData?.year })}
              </div>

              {taxData.pdfExport && (
                <Button
                  startIcon={<DownloadIcon className="size-5" />}
                  variant="black-outline"
                  text={t('download_pdf')}
                  size="sm"
                  className="hidden md:block"
                  onPress={downloadPdf}
                />
              )}
            </div>
            <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-4">
              <div className="flex gap-2">
                <div className="lg:text-p2-semibold text-p3-semibold">{t('tax_created')}</div>
                <div className="lg:text-p2 text-p3">{formatDate(taxData?.createdAt)}</div>
              </div>
              <div className="hidden size-1.5 rounded-full bg-black md:block" />
              <div className="lg:text-p2-bold text-p3">
                <FormatCurrencyFromCents value={taxData.amount} />
                {taxData.paidStatus === TaxPaidStatusEnum.PartiallyPaid && (
                  <span className="lg:text-p2 text-p3">
                    {t('tax_detail_section.tax_remainder_text', {
                      amount: currencyFromCentsFormatter.format(
                        taxData.amount - taxData.paidAmount,
                      ),
                    })}
                  </span>
                )}
              </div>
              <div className="hidden size-1.5 rounded-full bg-black md:block" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <TaxPaidStatus status={taxData.paidStatus} mobileIcon />
                  {/* <div className="lg:text-p2 text-p3">{formatDate(tax?.updatedAt)}</div> */}
                </div>
              </div>
            </div>

            {/* for mobile version */}
            {taxData.pdfExport && (
              <div className="block w-full md:hidden">
                <div className="flex flex-col gap-3">
                  <Button
                    startIcon={<DownloadIcon className="size-5" />}
                    variant="black-outline"
                    text={t('download_pdf')}
                    size="sm"
                    className="min-w-full"
                    onPress={downloadPdf}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
