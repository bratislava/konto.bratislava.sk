import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import ThankYouTile, {
  ThankYouTileProps,
} from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { ROUTES } from '@/src/utils/routes'

const useFormSentPageContent = (): Omit<ThankYouTileProps, 'variant'> => {
  const { t } = useTranslation('account')

  const { isTaxForm, formDefinition, isEmbedded } = useFormContext()
  const { feedbackLink } = formDefinition
  const { isSignedIn } = useSsrAuth()

  if (isTaxForm) {
    return {
      title: t('thank_you.form_submit_tax.title'),
      content: t('thank_you.form_submit_tax.content'),
      primaryButton: feedbackLink
        ? {
            title: t('thank_you.button_to_feedback'),
            href: feedbackLink,
          }
        : null,
    }
  }

  if (isEmbedded) {
    return {
      title: t('thank_you.form_submit.title'),
      content: t('thank_you.form_submit.content_embedded'),
      isContentCentered: true,
    }
  }

  const feedbackButton = feedbackLink
    ? {
        title: t('thank_you.button_to_feedback'),
        href: feedbackLink,
      }
    : null

  const userProfileButton = isSignedIn
    ? {
        title: t('thank_you.button_to_profile_text'),
        href: ROUTES.USER_PROFILE,
      }
    : null

  return {
    title: t('thank_you.form_submit.title'),
    content: [
      t('thank_you.form_submit.content_generic'),
      isSignedIn ? ` ${t('thank_you.form_submit.content_signed_in')}` : '',
      feedbackLink ? `\n\n${t('thank_you.form_submit.content_feedback')}` : '',
    ].join(''),
    isContentCentered: true,
    primaryButton: feedbackButton,
    secondaryButton: userProfileButton,
  }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21637-5313&t=9VxOW0GxS2SEYDIL-4
 */

const FormSentPageContent = () => {
  const { title, content, isContentCentered, primaryButton, secondaryButton } =
    useFormSentPageContent()

  return (
    <div className="py-6 lg:py-16">
      <ThankYouTile
        variant="success"
        title={title}
        content={content}
        isContentCentered={isContentCentered}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
      />
    </div>
  )
}

export default FormSentPageContent
