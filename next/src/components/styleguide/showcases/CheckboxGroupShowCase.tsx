import CheckboxGroup from '@/src/components/widget-components/Checkbox/CheckboxGroup'
import CheckboxGroupItem from '@/src/components/widget-components/Checkbox/CheckboxGroupItem'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const CheckboxGroupShowCase = () => {
  return (
    <Wrapper direction="column" title="Checkbox Group">
      <Stack direction="column">
        <CheckboxGroup onChange={() => {}} label="Label">
          <CheckboxGroupItem value="value1" isIndeterminate>
            Value
          </CheckboxGroupItem>
          <CheckboxGroupItem value="value2">Value</CheckboxGroupItem>
          <CheckboxGroupItem value="value3" isDisabled>
            Value
          </CheckboxGroupItem>
          <CheckboxGroupItem value="value4" error>
            Long text value
          </CheckboxGroupItem>
        </CheckboxGroup>
      </Stack>
      <Stack direction="column">
        <CheckboxGroup onChange={() => {}} label="Label">
          <CheckboxGroupItem value="value1" variant="boxed" isIndeterminate>
            Value
          </CheckboxGroupItem>
          <CheckboxGroupItem value="value2" variant="boxed">
            Value
          </CheckboxGroupItem>
          <CheckboxGroupItem value="value3" variant="boxed" isDisabled>
            Value
          </CheckboxGroupItem>
          <CheckboxGroupItem value="value4" variant="boxed" error>
            Long text value
          </CheckboxGroupItem>
        </CheckboxGroup>
      </Stack>
    </Wrapper>
  )
}

export default CheckboxGroupShowCase
