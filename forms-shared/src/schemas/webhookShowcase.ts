import { FormFiles } from '../definitions/formDefinitionTypes'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { input } from '../generator/functions/input'
import { schema } from '../generator/functions/schema'
import { step } from '../generator/functions/step'

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
      fileUploadMultiple<typeof webhookShowcaseFiles>(
        'buttonUpload',
        {
          title: 'Button Upload',
          required: true,
          slotId: 'upload',
        },
        {
          type: 'button',
          helptext: 'Click button to upload files',
        },
      ),
    ]),
  ],
)

export const webhookShowcaseFiles = {
  maxFileSize: undefined,
  maxTotalFileSize: undefined,
  slots: [
    {
      slotId: 'upload',
    },
  ],
} as const
