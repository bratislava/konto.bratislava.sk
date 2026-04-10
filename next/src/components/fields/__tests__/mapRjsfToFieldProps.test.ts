import { mapRjsfToFieldProps } from '../mapRjsfToFieldProps'

describe('mapRjsfToFieldProps', () => {
  const renderMarkdown = (text: string) => `<md>${text}</md>`

  it('maps basic RJSF props to field props', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Name', required: true, disabled: false, readonly: false, rawErrors: [] },
      {},
      renderMarkdown,
    )

    expect(result).toMatchObject({
      label: 'Name',
      isRequired: true,
      isDisabled: false,
      isReadOnly: false,
      displayOptionalLabel: true,
    })
  })

  it('joins rawErrors into single errorMessage', () => {
    const result = mapRjsfToFieldProps(
      {
        label: 'Email',
        required: false,
        disabled: false,
        readonly: false,
        rawErrors: ['too short', 'invalid format'],
      },
      {},
      renderMarkdown,
    )

    expect(result.errorMessage).toBe('too short, invalid format')
  })

  it('returns undefined errorMessage when rawErrors is empty', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: false, rawErrors: [] },
      {},
      renderMarkdown,
    )

    expect(result.errorMessage).toBeUndefined()
  })

  it('renders markdown helptext via callback', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: false, rawErrors: [] },
      { helptext: '**bold**', helptextMarkdown: true },
      renderMarkdown,
    )

    expect(result.helptext).toBe('<md>**bold**</md>')
  })

  it('passes plain helptext as-is', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: false, rawErrors: [] },
      { helptext: 'Plain text' },
      renderMarkdown,
    )

    expect(result.helptext).toBe('Plain text')
  })

  it('keeps isDisabled and isReadOnly separate', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: true, rawErrors: [] },
      {},
      renderMarkdown,
    )

    expect(result.isDisabled).toBe(false)
    expect(result.isReadOnly).toBe(true)
  })

  it('renders markdown helptextFooter via callback', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: false, rawErrors: [] },
      { helptextFooter: '*italic*', helptextFooterMarkdown: true },
      renderMarkdown,
    )

    expect(result.helptextFooter).toBe('<md>*italic*</md>')
  })

  it('passes labelSize from options', () => {
    const result = mapRjsfToFieldProps(
      { label: 'Email', required: false, disabled: false, readonly: false, rawErrors: [] },
      { labelSize: 'h3' },
      renderMarkdown,
    )

    expect(result.labelSize).toBe('h3')
  })
})
