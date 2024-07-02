import {
  checkboxGroup,
  conditionalStep,
  datePicker,
  fileUpload,
  input,
  radioGroup,
  schema,
  select,
  selectMultiple,
  step,
  textArea,
  timePicker,
} from '../generator/functions'
import { createCondition } from '../generator/helpers'

export default schema(
  {
    title: 'Showcase Schema',
  },
  {
    moreInformationUrl: 'https://example.com',
    titlePath: 'example.titlePath',
    titleFallback: 'Example Title Fallback',
  },
  [
    step('inputFieldsStep', { title: 'Input Fields Step' }, [
      input(
        'firstName',
        { title: 'First Name', required: true, type: 'text' },
        { resetIcon: true, leftIcon: 'person', placeholder: 'First Name' },
      ),
      input(
        'lastName',
        { title: 'Last Name', required: true, type: 'text' },
        { placeholder: 'Last Name' },
      ),
      input('email', { title: 'Email', required: true, type: 'email' }, { placeholder: 'Email' }),
      input(
        'password',
        { title: 'Password', required: true, type: 'password' },
        { placeholder: 'Password' },
      ),
      input('phone', { title: 'Phone Number', type: 'tel' }, { placeholder: 'Phone Number' }),
      input(
        'smallInput',
        { title: 'Small Input', type: 'text' },
        { size: 'small', placeholder: 'Small Input' },
      ),
      input(
        'mediumInput',
        { title: 'Medium Input', type: 'text' },
        { size: 'medium', placeholder: 'Medium Input' },
      ),
      input('largeInput', { title: 'Large Input', type: 'text' }, { placeholder: 'Large Input' }),
      textArea('about', { title: 'About', required: true }, { tooltip: 'Write about yourself' }),
    ]),
    step('selectionFieldsStep', { title: 'Selection Fields Step' }, [
      select(
        'gender',
        {
          title: 'Gender',
          required: true,
          options: [
            { value: 'male', title: 'Male', description: 'Male', isDefault: true },
            { value: 'female', title: 'Female', description: 'Female' },
          ],
        },
        {},
      ),
      selectMultiple(
        'favoriteColors',
        {
          title: 'Favorite Colors',
          required: true,
          minItems: 1,
          maxItems: 3,
          options: [
            { value: 'red', title: 'Red', description: 'Red' },
            { value: 'green', title: 'Green', description: 'Green', isDefault: true },
            { value: 'blue', title: 'Blue', description: 'Blue' },
            { value: 'yellow', title: 'Yellow', description: 'Yellow' },
            { value: 'pink', title: 'Pink', description: 'Pink' },
            { value: 'black', title: 'Black', description: 'Black' },
            { value: 'white', title: 'White', description: 'White' },
            { value: 'purple', title: 'Purple', description: 'Purple' },
            { value: 'orange', title: 'Orange', description: 'Orange' },
            { value: 'brown', title: 'Brown', description: 'Brown' },
          ],
        },
        {},
      ),
    ]),
    step('dateAndTimeStep', { title: 'Date and Time Step' }, [
      datePicker('birthDate', { title: 'Birth Date', required: true }, {}),
      timePicker('meetingTime', { title: 'Meeting Time' }, {}),
    ]),
    step('uploadStep', { title: 'Upload Step' }, [
      fileUpload(
        'profilePicture',
        { title: 'Profile Picture', required: true },
        { type: 'button' },
      ),
      fileUpload(
        'documents',
        { title: 'Documents', required: true, multiple: true },
        { type: 'dragAndDrop' },
      ),
      fileUpload(
        'multipleDocuments',
        { title: 'Multiple Documents', required: true, multiple: true },
        { type: 'button' },
      ),
    ]),
    step('checkboxesStep', { title: 'Checkboxes Step' }, [
      checkboxGroup(
        'preferences',
        {
          title: 'Preferences',
          required: true,
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              description: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', description: 'Updates' },
            { value: 'offers', title: 'Receive Offers', description: 'Offers' },
          ],
        },
        { variant: 'boxed' },
      ),
      checkboxGroup(
        'preferencesBasic',
        {
          title: 'Preferences Basic',
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              description: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', description: 'Updates' },
            { value: 'offers', title: 'Receive Offers', description: 'Offers' },
          ],
        },
        { variant: 'basic' },
      ),
    ]),
    step('radioButtonStep', { title: 'Radio Button Step' }, [
      radioGroup(
        'subscription',
        {
          type: 'string',
          title: 'Subscription',
          required: true,
          options: [
            { value: 'free', title: 'Free', description: 'Free', isDefault: true },
            { value: 'premium', title: 'Premium', description: 'Premium' },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      radioGroup(
        'subscriptionType',
        {
          type: 'string',
          title: 'Subscription Type',
          options: [
            { value: 'monthly', title: 'Monthly', description: 'Monthly' },
            { value: 'yearly', title: 'Yearly', description: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
      radioGroup(
        'xxx',
        {
          type: 'boolean',
          title: 'Subscription Type',
          options: [
            { value: true, title: 'Monthly', description: 'Monthly' },
            { value: false, title: 'Yearly', description: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
    ]),
    conditionalStep(
      'conditionalStep',
      createCondition([[['firstName'], { const: 'John' }]]),
      { title: 'Conditional Step' },
      [input('secretQuestion', { title: 'Secret Question' }, {})],
    ),
  ],
)
