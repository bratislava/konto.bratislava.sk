/* eslint-disable i18next/no-literal-string */
import Radio from '@/src/components/fields/Radio'
import RadioGroup from '@/src/components/fields/RadioGroup'
import RadioOLD from '@/src/components/widget-components/RadioButton/Radio'
import RadioGroupOLD from '@/src/components/widget-components/RadioButton/RadioGroup'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const RadioGroupShowCase = () => {
  const mock = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', isDisabled: true },
    {
      value: 'four',
      label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
  ]

  return (
    <>
      <Wrapper direction="column" title="RadioGroup RAC">
        <div>
          RadioGroup should usually be used as required. If it is not, consider other UI such as
          Select, or provide &quot;None of above&quot; option and make the group required. But in
          case it is optional, reset button is present.
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Stack direction="column">
            <RadioGroup isRequired label="Label">
              {mock.map((item) => (
                <Radio key={item.value} {...item}>
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </Stack>
          <Stack direction="column">
            <RadioGroup isRequired label="Label">
              {mock.map((item) => (
                <Radio key={item.value} {...item} variant="boxed">
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </Stack>
          <Stack>
            <RadioGroup isRequired defaultValue="one" label="With default value">
              <Radio value="one" variant="card">
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
            <RadioGroup label="If optional, reset button is present">
              {mock.map((item) => (
                <Radio key={item.value} {...item} variant="boxed">
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </Stack>
          <Stack direction="column">
            <RadioGroup isRequired label="With error" errorMessage="Error message">
              {mock.map((item) => (
                <Radio key={item.value} {...item} variant="boxed">
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </Stack>
          <Stack direction="column">
            <RadioGroup isRequired label="With everything" helptext="Helptext">
              {mock.map((item) => (
                <Radio key={item.value} {...item} variant="boxed">
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </Stack>
        </div>

        <Stack direction="column">
          <RadioGroup isRequired label="Orientation - horizontal" orientation="horizontal">
            <Radio value="yes" variant="boxed">
              Yes
            </Radio>
            <Radio value="no" variant="boxed">
              No
            </Radio>
          </RadioGroup>
        </Stack>
      </Wrapper>

      {/* TODO remove */}
      <Wrapper direction="column" title="Radio Group (Radio Buttons) OLD">
        <div>
          RadioGroup should usually be used as required. If it is not, consider other UI such as
          Select, or provide &quot;None of above&quot; option and make the group required. But in
          case it is optional, reset button is present.
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Stack direction="column">
            <RadioGroupOLD isRequired onChange={() => {}} label="Label">
              {mock.map((item) => (
                <RadioOLD key={item.value} {...item}>
                  {item.label}
                </RadioOLD>
              ))}
            </RadioGroupOLD>
          </Stack>
          <Stack direction="column">
            <RadioGroupOLD isRequired onChange={() => {}} label="Label" className="w-full">
              {mock.map((item) => (
                <RadioOLD key={item.value} {...item} variant="boxed">
                  {item.label}
                </RadioOLD>
              ))}
            </RadioGroupOLD>
          </Stack>
          <Stack>
            <RadioGroupOLD
              isRequired
              defaultValue="one"
              onChange={() => {}}
              label="With default value"
            >
              <RadioOLD value="one" variant="card">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </RadioOLD>
              <RadioOLD value="two" variant="card" isDisabled>
                Two
              </RadioOLD>
              <RadioOLD value="three" variant="card">
                Three
              </RadioOLD>
            </RadioGroupOLD>
          </Stack>
          <Stack direction="column">
            <RadioGroupOLD onChange={() => {}} label="If optional, reset button is present">
              {mock.map((item) => (
                <RadioOLD key={item.value} {...item} variant="boxed">
                  {item.label}
                </RadioOLD>
              ))}
            </RadioGroupOLD>
          </Stack>
          <Stack direction="column">
            <RadioGroupOLD
              isRequired
              onChange={() => {}}
              label="With error"
              errorMessage={['Error message']}
            >
              {mock.map((item) => (
                <RadioOLD key={item.value} {...item} variant="boxed">
                  {item.label}
                </RadioOLD>
              ))}
            </RadioGroupOLD>
          </Stack>
          <Stack direction="column">
            <RadioGroupOLD
              isRequired
              onChange={() => {}}
              label="With everything"
              helptext="Helptext"
            >
              {mock.map((item) => (
                <RadioOLD key={item.value} {...item} variant="boxed">
                  {item.label}
                </RadioOLD>
              ))}
            </RadioGroupOLD>
          </Stack>
        </div>
        <Stack direction="column">
          <RadioGroupOLD
            isRequired
            onChange={() => {}}
            label="Orientation - horizontal"
            orientation="horizontal"
            className="w-full"
          >
            <RadioOLD value="yes" variant="boxed">
              Yes
            </RadioOLD>
            <RadioOLD value="no" variant="boxed">
              No
            </RadioOLD>
          </RadioGroupOLD>
        </Stack>
      </Wrapper>
    </>
  )
}

export default RadioGroupShowCase
