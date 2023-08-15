import SingleCheckbox from 'components/forms/widget-components/Checkbox/SingleCheckbox'
import React from 'react'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SingleCheckboxShowCase = () => {
  return (
    <Wrapper direction="column" title="Single Checkbox">
      <Stack direction="column">
        <SingleCheckbox isIndeterminate tooltip="This is some tooltip">
          Some long long value text
        </SingleCheckbox>
        <SingleCheckbox isDisabled>Value</SingleCheckbox>
        <SingleCheckbox error>Value</SingleCheckbox>
      </Stack>
      <Stack direction="column">
        <SingleCheckbox variant="boxed" tooltip="This is some tooltip">
          Value
        </SingleCheckbox>
        <SingleCheckbox isIndeterminate variant="boxed" isDisabled>
          Value
        </SingleCheckbox>
        <SingleCheckbox variant="boxed" error>
          Value
        </SingleCheckbox>
      </Stack>
    </Wrapper>
  )
}

export default SingleCheckboxShowCase
