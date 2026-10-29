export type StrapiFormSentPage = {
  feedbackLink?: string | null
}

export const resolveFeedbackLink = (
  strapiFormSentPage: StrapiFormSentPage | null | undefined,
): string | null => {
  const feedbackLink = strapiFormSentPage?.feedbackLink?.trim()

  return feedbackLink || null
}
