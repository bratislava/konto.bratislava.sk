import PlatbaDaneImg from '@assets/images/platba-dane2.png'
import BannerBasic from 'components/forms/segments/AccountSections/IntroSection/BannerBasic'
import React from 'react'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const BannerShowCase = () => {
  return (
    <Wrapper title="Banner" direction="column">
      <Stack direction="column">
        <BannerBasic
          header="Banner Headline"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          imagePath={PlatbaDaneImg}
          buttonPrimaryText="Primary button"
          onPressPrimary={() => {
            alert('Button was pressed')
          }}
        />
      </Stack>
    </Wrapper>
  )
}

export default BannerShowCase
