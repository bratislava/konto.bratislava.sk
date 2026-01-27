import { input } from '../generator/functions/input'
import { step } from '../generator/functions/step'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'

export default schema(
  {
    title: 'Webhook showcase',
  },
  [
    step('textInputs', { title: 'Text Inputs' }, [
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
    ]),
    step('fileUploads', { title: 'File Uploads' }, [
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
      fileUploadMultiple(
        'dragAndDrop',
        {
          title: 'Drag and Drop Upload',
          required: true,
        },
        {
          type: 'dragAndDrop',
          accept: '.pdf,.jpg,.png',
          sizeLimit: 5000000,
          helptext: 'Drag files here or click to upload',
        },
      ),
    ]),
  ],
)
