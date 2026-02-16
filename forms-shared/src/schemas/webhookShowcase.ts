import { input } from '../generator/functions/input'
import { step } from '../generator/functions/step'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'

export default schema(
  {
    title: 'Webhook showcase',
  },
  [
    step('inputShowcase', { title: 'Input Showcase' }, [
      input(
        'basicText',
        {
          type: 'text',
          title: 'Basic Text Input',
          required: true,
        },
        {
          placeholder: 'Enter text here',
          helptext: 'Basic text input example',
        },
      ),
      fileUploadMultiple(
        'buttonUpload',
        {
          title: 'Button Upload',
          required: true,
        },
        {
          type: 'button',
          helptext: 'Click button to upload files',
        },
      ),
    ]),
  ],
)
