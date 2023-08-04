import React from 'react'

import Radio from '../../forms/widget-components/RadioButton/Radio'
import RadioGroup from '../../forms/widget-components/RadioButton/RadioGroup'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const RadioGroupShowCase = () => {
  const mock = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two', tooltip: 'Tooltip' },
    { value: 'three', label: 'Three', isDisabled: true },
    {
      value: 'four',
      label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
  ]

  return (
    <Wrapper direction="column" title="Radio Group (Radio Buttons)">
      <div>
        RadioGroup should usually be used as required. If it is not, consider other UI such as
        Select, or provide &quot;None of above&quot; option and make the group required. But in case
        it is optional, reset button is present.
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Stack direction="column">
          <RadioGroup required onChange={() => {}} label="Label">
            {mock.map((item) => (
              <Radio key={item.value} {...item}>
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
        <Stack direction="column">
          <RadioGroup required onChange={() => {}} label="Label" className="w-full">
            {mock.map((item) => (
              <Radio key={item.value} {...item} variant="boxed">
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
        <Stack>
          <RadioGroup required defaultValue="one" onChange={() => {}} label="With default value">
            <Radio
              value="one"
              variant="card"
              tooltip="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            >
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </Radio>
            <Radio value="two" variant="card" isDisabled>
              Two
            </Radio>
            <Radio value="three" variant="card">
              Three
            </Radio>
          </RadioGroup>
        </Stack>
        <Stack direction="column">
          <RadioGroup onChange={() => {}} label="If optional, reset button is present">
            {mock.map((item) => (
              <Radio key={item.value} {...item} variant="boxed">
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
        <Stack direction="column">
          <RadioGroup
            required
            onChange={() => {}}
            label="With error"
            errorMessage={['Error message']}
          >
            {mock.map((item) => (
              <Radio key={item.value} {...item} variant="boxed">
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
        <Stack direction="column">
          <RadioGroup
            required
            onChange={() => {}}
            label="With everything"
            helptext="Helptext"
            tooltip="Tooltip"
          >
            {mock.map((item) => (
              <Radio key={item.value} {...item} variant="boxed">
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
      </div>
      <Stack direction="column">
        <RadioGroup
          required
          onChange={() => {}}
          label="Orientation - horizontal"
          orientation="horizontal"
          className="w-full"
        >
          <Radio value="yes" variant="boxed">
            Yes
          </Radio>
          <Radio value="no" variant="boxed">
            No
          </Radio>
        </RadioGroup>
      </Stack>
    </Wrapper>
  )
}

export default RadioGroupShowCase
