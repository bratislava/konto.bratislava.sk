import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import EuFlagSvg from '@/src/assets/images/eu-flag.svg'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { useGeneralContext } from '@/src/components/logic/GeneralContextProvider'
import {
  FooterAccessibilityLink,
  FooterColumnLinks,
  FooterContacts,
  FooterCopyright,
  FooterSocialLinks,
} from '@/src/components/segments/Footer/FooterShared'
import Brand from '@/src/components/simple-components/Brand'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-34027&t=kxvcsTyGotEVpcH2-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/tree/master/next/src/components/common/Footer
 */

const DesktopFooter = () => {
  const { t } = useTranslation('account')
  const { footer } = useGeneralContext()

  if (!footer) {
    return null
  }

  return (
    <SectionContainer>
      <HorizontalDivider />
      <footer className="flex flex-col gap-6 py-6 lg:gap-8 lg:py-8">
        <div className="flex justify-between py-2 lg:py-0">
          <Brand
            className="group grow"
            url={ROUTES.HOME}
            title={
              <p className="text-p2 text-[#F23005]">
                {t('NavBar.capitalCityOfSR')}
                <span className="font-semibold"> Bratislava</span>
              </p>
            }
          />
          <div className="flex items-center gap-16">
            <div className="flex gap-6">
              <FooterSocialLinks {...footer} />
            </div>
            <EuFlagSvg />
          </div>
        </div>
        <HorizontalDivider />
        <div className="flex justify-between gap-8 *:grow">
          <FooterContacts {...footer} />
          {footer.columns?.filter(isDefined).map((column, index) => (
            <div className="flex flex-col gap-3 lg:gap-4" key={index}>
              <Typography
                variant="h5"
                as="h2"
                // TODO Handle heading font size and weight globally
                className="text-[1.25rem] font-semibold"
              >
                {column.title}
              </Typography>
              <div className="flex flex-col gap-3">
                <FooterColumnLinks {...column} />
              </div>
            </div>
          ))}
        </div>
        <HorizontalDivider />
        <div className="flex justify-center gap-6 lg:justify-normal">
          <FooterAccessibilityLink {...footer} />
        </div>
        <HorizontalDivider />
        <div className="text-size-p-small text-center">
          <FooterCopyright />
        </div>
      </footer>
    </SectionContainer>
  )
}

export default DesktopFooter
