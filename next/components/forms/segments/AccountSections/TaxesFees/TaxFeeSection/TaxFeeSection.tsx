import { ExportIcon } from '@assets/ui-icons'
import Alert from 'components/forms/info-components/Alert'
import ResponsiveCarousel from 'components/forms/ResponsiveCarousel'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import OfficialCorrespondenceChannelCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelCardWrapper'
import TaxesFeesAdministratorCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesAdministratorCard/TaxesFeesAdministratorCardWrapper'
import TaxFeeAccordions from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeAccordions'
import TaxFeeContactInformation from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeContactInformation'
import TaxFeePaymentMethods from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentMethods/TaxFeePaymentMethods'
import TaxFeePaymentSummary from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentSummary'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { EXTERNAL_LINKS, ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import React from 'react'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1608&t=fznV5maoQK8a2irI-4
 */

const TaxFeeSection = () => {
  const { t } = useTranslation('account')
  const { taxData, strapiTaxAdministrator } = useTaxFeeSection()

  const pageTitle = {
    // TODO order missing in title maybe
    // TODO this text is also in TaxesFeesCard, consider unifying
    [TaxType.Dzn]: t('tax_detail_section.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('tax_detail_section.title.ko', { year: taxData.year }),
  }[taxData.type]

  // TODO this is duplicated in TaxFeePaymentSection.tsx
  const pageBreadcrumbTitle = {
    [TaxType.Dzn]: t('account_section_payment.tax_detail.tax'),
    [TaxType.Ko]: t('account_section_payment.tax_detail.fee'),
  }[taxData.type]

  const taxFeeAccordionsHeader = {
    [TaxType.Dzn]: t('taxes.tax_details.tax_liability_breakdown.taxes'),
    [TaxType.Ko]: t('taxes.tax_details.tax_liability_breakdown.fees'),
  }[taxData.type]

  const taxFeeAccordionsHeaderLinkProps = {
    [TaxType.Dzn]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_DZN,
      children: t('tax_detail_section.tax_detail_fees_link.dzn'),
    },
    [TaxType.Ko]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_KO,
      children: t('tax_detail_section.tax_detail_fees_link.ko'),
    },
  }[taxData.type]

  const breadcrumbs = [
    { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
    { title: pageBreadcrumbTitle, path: null },
  ]

  const isTaxFeeSuccessfullyPaid =
    taxData.paidStatus === TaxStatusEnum.Paid || taxData.paidStatus === TaxStatusEnum.OverPaid

  const showTaxFeePaidAlert = isTaxFeeSuccessfullyPaid
  const showPaymentMethods = !isTaxFeeSuccessfullyPaid

  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader title={pageTitle} breadcrumbs={breadcrumbs} />
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-10 lg:py-10">
        {showTaxFeePaidAlert && (
          <div className="w-full px-4 lg:px-0">
            <Alert type="success" fullWidth message={t('account_section_payment.tax_paid')} />
          </div>
        )}
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:px-0">
          <ResponsiveCarousel
            controlsVariant="side"
            desktop={2}
            hasVerticalPadding={false}
            items={[
              <OfficialCorrespondenceChannelCardWrapper />,
              <TaxesFeesAdministratorCardWrapper
                taxType={taxData.type}
                beTaxAdministrator={taxData.taxAdministrator}
                strapiTaxAdministrator={strapiTaxAdministrator}
              />,
            ]}
          />
        </div>
        <TaxFeeContactInformation />
        <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
          <div className="flex w-full flex-col justify-between gap-3 lg:flex-row">
            <span className="text-h3">{taxFeeAccordionsHeader}</span>
            <div className="flex items-center justify-between gap-2">
              <ButtonNew
                variant="black-link"
                endIcon={<ExportIcon />}
                {...taxFeeAccordionsHeaderLinkProps}
              />
            </div>
          </div>
          <TaxFeeAccordions />
          <TaxFeePaymentSummary />
        </div>
        {showPaymentMethods && <TaxFeePaymentMethods />}
      </div>
    </div>
  )
}

export default TaxFeeSection
