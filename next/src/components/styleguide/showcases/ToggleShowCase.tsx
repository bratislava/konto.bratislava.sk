/* eslint-disable i18next/no-literal-string */
import { useState } from 'react'

import Toggle from '@/src/components/simple-components/Toggle'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ToggleShowCase = () => {
  const [secondToggleSelected, setSecondToggleSelected] = useState<boolean>(true)

  return (
    <Wrapper direction="column" title="Toggle">
      <Stack direction="column" className="items-start gap-4">
        <Toggle />
        <Toggle isSelected={secondToggleSelected} onChange={setSecondToggleSelected}>
          Value (controlled)
        </Toggle>
        <Toggle isDisabled defaultSelected>
          Value
        </Toggle>
        <Toggle isDisabled>Value</Toggle>
        <Toggle isReadOnly>Read only</Toggle>
        <Toggle defaultSelected>defaultSelected (uncontrolled)</Toggle>
      </Stack>
    </Wrapper>
  )
}

export default ToggleShowCase
