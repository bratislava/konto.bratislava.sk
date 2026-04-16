/* eslint-disable i18next/no-literal-string */
import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import CheckboxGroupOLD from '@/src/components/widget-components/Checkbox/CheckboxGroup'
import CheckboxGroupItemOLD from '@/src/components/widget-components/Checkbox/CheckboxGroupItem'

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

  return (
    <>
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
            <CheckboxGroup label="Label">
              {mockWithDescription.map((checkbox) => (
                <Checkbox key={checkbox.value} {...checkbox}>
                  {checkbox.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Stack>
          <Stack direction="column">
            <CheckboxGroup label="Label">
              {mockWithDescription.map((checkbox) => (
                <Checkbox key={checkbox.value} {...checkbox} variant="boxed">
                  {checkbox.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Stack>
          <Stack direction="column">
            <CheckboxGroup label="Label" errorMessage="Error message">
              {mockWithDescription.map((checkbox) => (
                <Checkbox key={checkbox.value} {...checkbox} variant="boxed">
                  {checkbox.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Stack>
        </div>
      </Wrapper>

      {/* TODO remove */}
      <Wrapper direction="column" title="Checkbox Group OLD">
        <Stack direction="column">
          <CheckboxGroupOLD onChange={() => {}} label="Label">
            <CheckboxGroupItemOLD value="value1" isIndeterminate>
              Value
            </CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value2">Value</CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value3" isDisabled>
              Value
            </CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value4" error>
              Long text value
            </CheckboxGroupItemOLD>
          </CheckboxGroupOLD>
        </Stack>
        <Stack direction="column">
          <CheckboxGroupOLD onChange={() => {}} label="Label">
            <CheckboxGroupItemOLD value="value1" variant="boxed" isIndeterminate>
              Value
            </CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value2" variant="boxed">
              Value
            </CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value3" variant="boxed" isDisabled>
              Value
            </CheckboxGroupItemOLD>
            <CheckboxGroupItemOLD value="value4" variant="boxed" error>
              Long text value
            </CheckboxGroupItemOLD>
          </CheckboxGroupOLD>
        </Stack>
      </Wrapper>
    </>
  )
}

export default CheckboxGroupShowCase
