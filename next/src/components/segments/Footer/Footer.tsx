import DesktopFooter from '@/src/components/segments/Footer/DesktopFooter'
import MobileFooter from '@/src/components/segments/Footer/MobileFooter'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-34027&t=kxvcsTyGotEVpcH2-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/tree/master/next/src/components/common/Footer
 */

const Footer = () => {
  return (
    <>
      <div className="hidden lg:block">
        <DesktopFooter />
      </div>
      <div className="lg:hidden">
        <MobileFooter />
      </div>
    </>
  )
}

export default Footer
