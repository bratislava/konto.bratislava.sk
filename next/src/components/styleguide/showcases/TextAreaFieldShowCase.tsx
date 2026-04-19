import TextAreaField from '@/src/components/fields/TextAreaField'
import TextAreaFieldOLD from '@/src/components/widget-components/TextAreaField/TextAreaField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'

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

      <Wrapper direction="row">
        <Stack direction="column">
          <TextAreaField label="Editable with long text" defaultValue={LONG_TEXT} />
        </Stack>
        <Stack direction="column">
          <TextAreaField label="Disabled with long text" defaultValue={LONG_TEXT} isDisabled />
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
