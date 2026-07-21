import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const CheckboxGroupShowCase = () => {
  const mock = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', isDisabled: true },
    {
      value: 'four',
      label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
  ]

  const mockWithDescription = [
    { value: 'one', label: 'One', description: 'Lorem Ipsum' },
    { value: 'two', label: 'Two', description: 'Lorem Ipsum' },
    { value: 'three', label: 'Three', description: 'Lorem Ipsum', isDisabled: true },
    {
      value: 'four',
      label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
  ]

  const mockWithMixedDescription = [
    { value: 'one', label: 'One', description: 'Lorem Ipsum' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three' },
    {
      value: 'four',
      label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
  ]

  return (
    <Wrapper direction="column" title="CheckboxGroup RAC">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Stack direction="column">
          <CheckboxGroup label="Label">
            {mock.map((checkbox) => (
              <Checkbox key={checkbox.value} {...checkbox}>
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
        <Stack direction="column">
          <CheckboxGroup label="Label">
            {mock.map((checkbox) => (
              <Checkbox key={checkbox.value} {...checkbox} variant="boxed">
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
        <Stack direction="column">
          <CheckboxGroup label="Label" errorMessage="Error message">
            {mock.map((checkbox) => (
              <Checkbox key={checkbox.value} {...checkbox} variant="boxed">
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Stack direction="column">
          <CheckboxGroup
            label="All with description"
            helptext="This combination - basic variant with options with description - should not be used, I guess."
          >
            {mockWithDescription.map((checkbox) => (
              <Checkbox key={checkbox.value} {...checkbox} hasDescriptionInCheckboxGroup>
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
        <Stack direction="column">
          <CheckboxGroup label="All with description (boxed)">
            {mockWithDescription.map((checkbox) => (
              <Checkbox
                key={checkbox.value}
                {...checkbox}
                variant="boxed"
                hasDescriptionInCheckboxGroup
              >
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
        <Stack direction="column">
          <CheckboxGroup
            label="Mixed description (boxed)"
            helptext="This showcase checks, if labels are rendered correctly with semi-bold font, even if not all options have description."
          >
            {mockWithMixedDescription.map((checkbox) => (
              <Checkbox
                key={checkbox.value}
                {...checkbox}
                variant="boxed"
                hasDescriptionInCheckboxGroup
              >
                {checkbox.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
      </div>
    </Wrapper>
  )
}

export default CheckboxGroupShowCase
