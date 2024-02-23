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
            { value: 'male', title: 'Male', tooltip: 'Male', isDefault: true },
            { value: 'female', title: 'Female', tooltip: 'Female' },
          ],
        },
        { dropdownDivider: true },
      ),
      selectMultiple(
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
              tooltip: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', tooltip: 'Updates' },
            { value: 'offers', title: 'Receive Offers', tooltip: 'Offers' },
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
      radioGroup(
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
      radioGroup(
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
      radioGroup(
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
      [input('secretQuestion', { title: 'Secret Question' }, {})],
    ),
  ],
)
