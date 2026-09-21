import { useTranslation } from 'next-i18next/pages'

import Markdown from '@/src/components/formatting/Markdown'
import { useFormContext } from '@/src/components/forms/useFormContext'
import ThankYouTile, {
  ThankYouTileProps,
} from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import { ROUTES } from '@/src/utils/routes'

const useFormSentPageContent = (): Omit<ThankYouTileProps, 'variant'> => {
  const { t } = useTranslation()

  const { isTaxForm, isEmbedded, strapiFormSentPage } = useFormContext()

  const feedbackLink = strapiFormSentPage?.feedbackLink?.trim()

  const contentFromStrapi = strapiFormSentPage?.content?.trim()
  const isContentCentered = strapiFormSentPage?.isContentCentered ?? true

  const alertTitle = strapiFormSentPage?.alert?.title?.trim()
  const alertContent = strapiFormSentPage?.alert?.content?.trim()
  const alertProps: ThankYouTileProps['alert'] =
    alertTitle || alertContent
      ? {
          type: 'warning',
          title: alertTitle,
          message: alertContent ? <Markdown variant="small" content={alertContent} /> : undefined,
        }
      : null

  const feedbackButton = feedbackLink
    ? {
        label: t('FormSentPageContent.buttons.toFeedback'),
        href: feedbackLink,
      }
    : null

  const municipalServicesButton = {
    label: t('FormSentPageContent.buttons.toMunicipalServices'),
    href: ROUTES.MUNICIPAL_SERVICES,
  }

  if (isEmbedded) {
    return {
      title: t('FormSentPageContent.title'),
      content: contentFromStrapi ?? t('FormSentPageContent.content_embedded'),
      isContentCentered,
      alert: alertProps,
    }
  }

  if (isTaxForm) {
    return {
      title: t('FormSentPageContent.title'),
      content: contentFromStrapi ?? t('FormSentPageContent.content_tax'),
      isContentCentered,
      alert: alertProps,
      primaryButton: feedbackButton,
      secondaryButton: municipalServicesButton,
    }
  }

  return {
    title: t('FormSentPageContent.title'),
    content: contentFromStrapi ?? t('FormSentPageContent.content'),
    isContentCentered,
    alert: alertProps,
    primaryButton: feedbackButton,
    secondaryButton: municipalServicesButton,
  }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21637-5313&t=9VxOW0GxS2SEYDIL-4
 */

const FormSentPageContent = () => {
  const { title, content, isContentCentered, alert, primaryButton, secondaryButton } =
    useFormSentPageContent()

  return (
    <div className="py-6 lg:py-16">
      <ThankYouTile
        variant="success"
        title={title}
        content={content}
        isContentCentered={isContentCentered}
        alert={alert}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
      />
    </div>
  )
}

export default FormSentPageContent
