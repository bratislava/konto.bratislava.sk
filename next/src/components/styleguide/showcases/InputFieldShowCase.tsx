import React from 'react'

import InputField from '@/src/components/widget-components/InputField/InputField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const InputFieldShowCase = () => {
  return (
    <Wrapper direction="column" title="Input Field">
      <Stack direction="column">
        <InputField label="Label" placeholder="Placeholder" />
        <InputField label="Label" placeholder="Placeholder" value="Value" />
        <InputField label="Label" placeholder="Placeholder" errorMessage={['Error message']} />
        <InputField
          label="Label"
          placeholder="Placeholder"
          errorMessage={['Error message']}
          isDisabled
        />
      </Stack>
      <Stack direction="column">
        <InputField label="Label" placeholder="Placeholder" helptext="Help text" />
        <InputField
          label="Label"
          placeholder="Placeholder"
          value="Value"
          helptext="Help text"
          isRequired
        />
        <InputField
          label="Label"
          placeholder="Placeholder"
          helptext="Help text"
          isRequired
          errorMessage={['Error message']}
        />
        <InputField
          label="Label"
          placeholder="Placeholder"
          helptext="Help text"
          isRequired
          errorMessage={['Error message']}
          isDisabled
        />
      </Stack>
      <Stack direction="column">
        <InputField label="Label" placeholder="Placeholder" helptext="Help text" leftIcon="mail" />
        <InputField
          label="Label"
          placeholder="Placeholder"
          value="Value"
          helptext="Help text"
          leftIcon="call"
        />
        <InputField
          label="Label"
          type="password"
          placeholder="Placeholder"
          helptext="Help text"
          leftIcon="lock"
          errorMessage={['Error message']}
        />
        <InputField
          label="Label"
          placeholder="Placeholder"
          helptext="Help text"
          leftIcon="person"
          errorMessage={['Error message']}
          isDisabled
        />
      </Stack>
    </Wrapper>
  )
}

export default InputFieldShowCase
