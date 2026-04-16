import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'
import { Fragment } from 'react'

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
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-34027&t=kxvcsTyGotEVpcH2-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/tree/master/next/src/components/common/Footer
 */

const MobileFooter = () => {
  const { t } = useTranslation('account')
  const { footer } = useGeneralContext()

  if (!footer) {
    return null
  }

  return (
    <SectionContainer>
      <HorizontalDivider />
      <footer className="flex flex-col gap-6 py-6">
        <div className="flex justify-center py-2 md:justify-start">
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
        </div>
        <div className="flex flex-col gap-6">
          <FooterContacts {...footer} />
        </div>
        <div>
          <DisclosureGroup>
            {footer.columns?.filter(isDefined).map((column, index) => (
              <Fragment key={index}>
                <HorizontalDivider />
                <Disclosure>
                  <DisclosureHeader className="py-6">
                    <Typography
                      variant="h4"
                      as="h3"
                      // TODO Handle heading font size and weight globally
                      className="text-[1rem] font-semibold"
                    >
                      {column.title}
                    </Typography>
                  </DisclosureHeader>
                  <DisclosurePanel>
                    <div className="flex flex-col gap-3">
                      <FooterColumnLinks {...column} />
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              </Fragment>
            ))}
          </DisclosureGroup>
          <HorizontalDivider />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="-my-2 flex gap-4">
            <FooterSocialLinks {...footer} />
          </div>
          <EuFlagSvg />
        </div>
        <HorizontalDivider />
        <div className="flex gap-4">
          <FooterAccessibilityLink {...footer} />
        </div>
        <HorizontalDivider />
        <div className="text-size-p-small">
          <FooterCopyright />
        </div>
      </footer>
    </SectionContainer>
  )
}

export default MobileFooter
