import Icon, { IconName, iconNameMap } from '@/src/components/icon-components/Icon'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const IconShowCase = () => {
  return (
    <Wrapper direction="column" title="Icon">
      <div>See comments in the code for more details how to resize icon.</div>
      <Stack>
        {/* You can safely use icon without className to render it in standard size */}
        <Icon name="calendar" />
        {/* To specify size, use className width and height */}
        <Icon name="calendar" className="size-4" />
        <Icon name="calendar" className="size-5" />
        <Icon name="calendar" className="size-6" />
        <Icon name="calendar" className="size-8" />
        {/* Passing icon as child to SMALLER flexbox kind of works */}
        <span className="flex size-5 items-center justify-center">
          <Icon name="calendar" />
        </span>
        {/* However, to make it bigger or smaller properly, you need to address it with css as child
            This is useful when you expect icon as child, e.g. startIcon in Button */}
        <span className="size-8 [&>svg]:size-full">
          <Icon name="calendar" fill="white" />
        </span>
      </Stack>
      <Stack>
        {/* TODO: set fill color to currentColor */}
        {/* TODO: check and remove icn-components folder */}
        {/* TODO: Create new icons: */}
        {/* <QrCodeIcon />*/}
        {/* <ApplePayIcon /> */}
        {/* <GooglePayIcon /> */}
        {/* <LinkVariantIcon /> */}
        {Object.keys(iconNameMap).map((name) => {
          return <Icon key={name} name={name as IconName} fill="white" />
        })}
      </Stack>
    </Wrapper>
  )
}

export default IconShowCase
