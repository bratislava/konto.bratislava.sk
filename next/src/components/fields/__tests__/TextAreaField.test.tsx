import { render, screen } from '@testing-library/react'

import TextAreaField from '../TextAreaField'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'FieldHeader.optional': '(Nepovinne)',
      }

      return translations[key] ?? key
    },
  }),
}))

describe('TextAreaField', () => {
  it('renders label and textarea', () => {
    render(<TextAreaField label="Description" isRequired />)

    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('renders error message', () => {
    render(<TextAreaField label="Description" isRequired errorMessage="Required" />)

    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders helptext', () => {
    render(<TextAreaField label="Description" isRequired helptext="Max 500 chars" />)

    expect(screen.getByText('Max 500 chars')).toBeInTheDocument()
  })
})
