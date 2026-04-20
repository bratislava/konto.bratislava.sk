import PasswordField from '@/src/components/fields/PasswordField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const PasswordFieldShowCase = () => {
  return (
    <Wrapper direction="row" title="PasswordField RAC">
      <Stack direction="column">
        <PasswordField label="Label" />
        <PasswordField label="Label" value="absdefgh" />
        <PasswordField label="Label" errorMessage="Error message" />
        <PasswordField label="Label" errorMessage="Error message" isDisabled />
      </Stack>
      <Stack direction="column">
        <PasswordField label="Label" isRequired helptext="Help text" />
        <PasswordField label="Label" isRequired value="absdefgh" helptext="Help text" />
        <PasswordField label="Label" isRequired helptext="Help text" errorMessage="Error message" />
        <PasswordField
          label="Label"
          helptext="Help text"
          isRequired
          errorMessage="Error message"
          isDisabled
        />
      </Stack>
    </Wrapper>
  )
}

export default PasswordFieldShowCase
