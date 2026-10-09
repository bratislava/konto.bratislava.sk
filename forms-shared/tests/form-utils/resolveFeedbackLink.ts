import { describe, expect, test } from 'vitest'

import { resolveFeedbackLink } from '../../src/form-utils/resolveFeedbackLink'

describe('resolveFeedbackLink', () => {
  const feedbackLink = 'https://test.feedback.com/bratislava/'

  test('returns the feedback link', () => {
    expect(resolveFeedbackLink({ feedbackLink })).toBe(feedbackLink)
  })

  test('trims the feedback link', () => {
    expect(resolveFeedbackLink({ feedbackLink: `  ${feedbackLink}\n` })).toBe(feedbackLink)
  })

  test.each([
    { label: 'form sent page is null', strapiFormSentPage: null },
    { label: 'form sent page is undefined', strapiFormSentPage: undefined },
    { label: 'feedback link is missing', strapiFormSentPage: {} },
    { label: 'feedback link is null', strapiFormSentPage: { feedbackLink: null } },
    { label: 'feedback link is empty', strapiFormSentPage: { feedbackLink: '' } },
    { label: 'feedback link is blank', strapiFormSentPage: { feedbackLink: '   ' } },
  ])('returns null when $label', ({ strapiFormSentPage }) => {
    expect(resolveFeedbackLink(strapiFormSentPage)).toBeNull()
  })
})
