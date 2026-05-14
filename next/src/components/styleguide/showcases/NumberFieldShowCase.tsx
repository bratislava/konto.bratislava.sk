import NumberField from '@/src/components/fields/NumberField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const NumberFieldShowCase = () => {
  return (
    <Wrapper direction="row" title="NumberField RAC">
      <Stack direction="column">
        <NumberField label="Label" />
        <NumberField label="Label" placeholder="Placeholder (do not use)" />
        <NumberField label="Label" value={42} />
        <NumberField label="Label" errorMessage="Error message" />
        <NumberField label="Label" errorMessage="Error message" isDisabled />
      </Stack>
      <Stack direction="column">
        <NumberField label="Label" isRequired helptext="Help text" />
        <NumberField label="Label" isRequired value={42} helptext="Help text" />
        <NumberField label="Label" isRequired helptext="Help text" errorMessage="Error message" />
        <NumberField
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

export default NumberFieldShowCase
