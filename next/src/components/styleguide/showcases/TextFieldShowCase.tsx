import TextField from '@/src/components/fields/TextField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const TextFieldShowCase = () => {
  return (
    <Wrapper direction="row" title="TextField RAC">
      <Stack direction="column">
        <TextField label="Label" />
        <TextField label="Label" placeholder="Placeholder (do not use)" />
        <TextField label="Label" value="Value" />
        <TextField label="Label" errorMessage="Error message" />
        <TextField label="Label" errorMessage="Error message" isDisabled />
      </Stack>
      <Stack direction="column">
        <TextField label="Label" isRequired helptext="Help text" />
        <TextField label="Label" isRequired value="Value" helptext="Help text" />
        <TextField label="Label" isRequired helptext="Help text" errorMessage="Error message" />
        <TextField
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

export default TextFieldShowCase
