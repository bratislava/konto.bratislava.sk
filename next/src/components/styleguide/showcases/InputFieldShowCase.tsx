import TextField from '@/src/components/fields/TextField'
import InputField from '@/src/components/widget-components/InputField/InputField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

// TODO rename to TextFieldShowCase
const InputFieldShowCase = () => {
  return (
    <>
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

      {/* TODO remove */}
      <Wrapper direction="row" title="Input Field OLD">
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
      </Wrapper>
    </>
  )
}

export default InputFieldShowCase
