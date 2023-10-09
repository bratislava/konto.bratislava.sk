import {
  checkboxes,
  conditionalStep,
  datePicker,
  inputField,
  radioButton,
  schema,
  selectField,
  selectMultipleField,
  step,
  textArea,
  timePicker,
  upload,
} from '../generator/functions'
import { createCondition } from '../generator/helpers'

export default schema(
  {
    title: 'Showcase Schema',
    pospID: 'showcase.schema',
    pospVersion: '0.1',
  },
  {
    moreInformationUrl: 'https://example.com',
    titlePath: 'example.titlePath',
    titleFallback: 'Example Title Fallback',
  },
  [
    step('inputFieldsStep', { title: 'Input Fields Step' }, [
      inputField(
        'firstName',
        { title: 'First Name', required: true, type: 'text' },
        { resetIcon: true, leftIcon: 'person', placeholder: 'First Name' },
      ),
      inputField(
        'lastName',
        { title: 'Last Name', required: true, type: 'text' },
        { placeholder: 'Last Name' },
      ),
      inputField(
        'email',
        { title: 'Email', required: true, type: 'email' },
        { placeholder: 'Email' },
      ),
      inputField(
        'password',
        { title: 'Password', required: true, type: 'password' },
        { placeholder: 'Password' },
      ),
      inputField('phone', { title: 'Phone Number', type: 'tel' }, { placeholder: 'Phone Number' }),
      inputField(
        'smallInput',
        { title: 'Small Input', type: 'text' },
        { size: 'small', placeholder: 'Small Input' },
      ),
      inputField(
        'defaultInput',
        { title: 'Default Input', type: 'text' },
        { size: 'default', placeholder: 'Default Input' },
      ),
      inputField(
        'largeInput',
        { title: 'Large Input', type: 'text' },
        { size: 'large', placeholder: 'Large Input' },
      ),
      textArea('about', { title: 'About', required: true }, { tooltip: 'Write about yourself' }),
    ]),
    step('selectionFieldsStep', { title: 'Selection Fields Step' }, [
      selectField(
        'gender',
        {
          title: 'Gender',
          required: true,
          options: [
            { value: 'male', title: 'Male', tooltip: 'Male', isDefault: true },
            { value: 'female', title: 'Female', tooltip: 'Female' },
          ],
        },
        { dropdownDivider: true },
      ),
      selectMultipleField(
        'favoriteColors',
        {
          title: 'Favorite Colors',
          required: true,
          minItems: 1,
          maxItems: 3,
          options: [
            { value: 'red', title: 'Red', tooltip: 'Red' },
            { value: 'green', title: 'Green', tooltip: 'Green', isDefault: true },
            { value: 'blue', title: 'Blue', tooltip: 'Blue' },
            { value: 'yellow', title: 'Yellow', tooltip: 'Yellow' },
            { value: 'pink', title: 'Pink', tooltip: 'Pink' },
            { value: 'black', title: 'Black', tooltip: 'Black' },
            { value: 'white', title: 'White', tooltip: 'White' },
            { value: 'purple', title: 'Purple', tooltip: 'Purple' },
            { value: 'orange', title: 'Orange', tooltip: 'Orange' },
            { value: 'brown', title: 'Brown', tooltip: 'Brown' },
          ],
        },
        { dropdownDivider: true },
      ),
    ]),
    step('dateAndTimeStep', { title: 'Date and Time Step' }, [
      datePicker('birthDate', { title: 'Birth Date', required: true }, {}),
      timePicker('meetingTime', { title: 'Meeting Time' }, {}),
    ]),
    step('uploadStep', { title: 'Upload Step' }, [
      upload('profilePicture', { title: 'Profile Picture', required: true }, { type: 'button' }),
      upload(
        'documents',
        { title: 'Documents', required: true, multiple: true },
        { type: 'dragAndDrop' },
      ),
      upload(
        'multipleDocuments',
        { title: 'Multiple Documents', required: true, multiple: true },
        { type: 'button' },
      ),
    ]),
    step('checkboxesStep', { title: 'Checkboxes Step' }, [
      checkboxes(
        'preferences',
        {
          title: 'Preferences',
          required: true,
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              tooltip: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', tooltip: 'Updates' },
            { value: 'offers', title: 'Receive Offers', tooltip: 'Offers' },
          ],
        },
        { variant: 'boxed' },
      ),
      checkboxes(
        'preferencesBasic',
        {
          title: 'Preferences Basic',
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              tooltip: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', tooltip: 'Updates' },
            { value: 'offers', title: 'Receive Offers', tooltip: 'Offers' },
          ],
        },
        { variant: 'basic' },
      ),
    ]),
    step('radioButtonStep', { title: 'Radio Button Step' }, [
      radioButton(
        'subscription',
        {
          type: 'string',
          title: 'Subscription',
          required: true,
          options: [
            { value: 'free', title: 'Free', tooltip: 'Free', isDefault: true },
            { value: 'premium', title: 'Premium', tooltip: 'Premium' },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      radioButton(
        'subscriptionType',
        {
          type: 'string',
          title: 'Subscription Type',
          options: [
            { value: 'monthly', title: 'Monthly', tooltip: 'Monthly' },
            { value: 'yearly', title: 'Yearly', tooltip: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
      radioButton(
        'xxx',
        {
          type: 'boolean',
          title: 'Subscription Type',
          options: [
            { value: true, title: 'Monthly', tooltip: 'Monthly' },
            { value: false, title: 'Yearly', tooltip: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
    ]),
    conditionalStep(
      'conditionalStep',
      createCondition([[['firstName'], { const: 'John' }]]),
      { title: 'Conditional Step' },
      [inputField('secretQuestion', { title: 'Secret Question' }, { size: 'large' })],
    ),
  ],
)
