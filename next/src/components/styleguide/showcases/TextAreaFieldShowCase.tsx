import TextAreaField from '@/src/components/fields/TextAreaField'
import TextAreaFieldOLD from '@/src/components/widget-components/TextAreaField/TextAreaField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const TextAreaFieldShowCase = () => {
  return (
    <>
      <Wrapper direction="row" title="Text Area Field RAC">
        <Stack direction="column">
          <TextAreaField label="Label" />
          <TextAreaField label="Label" defaultValue="Message" />
          <TextAreaField
            label="Label"
            placeholder="Placeholder (do not use)"
            errorMessage="Error message"
          />
          <TextAreaField
            label="Label"
            errorMessage="Error message"
            helptext="Help text"
            isDisabled
          />
        </Stack>
        <Stack direction="column">
          <TextAreaField label="Label" isRequired />
          <TextAreaField label="Label" isRequired value="Message" />
          <TextAreaField label="Label" isRequired errorMessage="Error message" />
          <TextAreaField
            label="Label"
            isRequired
            helptext="Help text"
            errorMessage="Error message"
            isDisabled
          />
        </Stack>
      </Wrapper>

      {/* TODO remove */}
      <Wrapper direction="row" title="Text Area Field OLD">
        <Stack direction="column">
          <TextAreaFieldOLD label="Label" placeholder="Placeholder" className="h-[200px]" />
          <TextAreaFieldOLD
            label="Label"
            placeholder="Placeholder"
            defaultValue="Default message"
            className="h-[200px]"
          />
          <TextAreaFieldOLD
            label="Label"
            placeholder="Placeholder"
            errorMessage={['Error message']}
            className="h-[200px]"
          />
          <TextAreaFieldOLD
            label="Label"
            placeholder="Placeholder"
            errorMessage={['Error message']}
            helptext="Help text"
            isDisabled
          />
        </Stack>
        <Stack direction="column">
          <TextAreaFieldOLD label="Label" isRequired placeholder="Placeholder" />
          <TextAreaFieldOLD label="Label" placeholder="Placeholder" value="Value" />
          <TextAreaFieldOLD
            label="Label"
            placeholder="Placeholder"
            errorMessage={['Error message']}
          />
          <TextAreaFieldOLD
            label="Label"
            isRequired
            placeholder="Placeholder"
            helptext="Help text"
            errorMessage={['Error message']}
            isDisabled
          />
        </Stack>
      </Wrapper>
    </>
  )
}

export default TextAreaFieldShowCase
