import { Typography } from '@bratislava/component-library'

import EuFlagSvg from '@/src/assets/images/eu-flag.svg'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { useGeneralContext } from '@/src/components/logic/GeneralContextProvider'
import CookieConsentLink from '@/src/components/segments/CookieConsentLink/CookieConsentLink'
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

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-34027&t=kxvcsTyGotEVpcH2-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/tree/master/next/src/components/common/Footer
 */

const DesktopFooter = () => {
  const { footer } = useGeneralContext()

  if (!footer) {
    return null
  }

  return (
    <SectionContainer>
      <HorizontalDivider />
      <footer className="flex flex-col gap-6 py-6 lg:gap-8 lg:py-8">
        <div className="flex justify-between py-2 lg:py-0">
          <Brand className="grow" variant="footer" />
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
              <Typography variant="h5" as="h2">
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
          <CookieConsentLink />
          <FooterAccessibilityLink {...footer} />
        </div>
        <HorizontalDivider />
        <div className="text-center text-size-p-small">
          <FooterCopyright />
        </div>
      </footer>
    </SectionContainer>
  )
}

export default DesktopFooter
