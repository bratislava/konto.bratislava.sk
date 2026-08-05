import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import ThankYouTile, {
  ThankYouTileProps,
} from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import { ROUTES } from '@/src/utils/routes'

const useFormSentPageContent = (): Omit<ThankYouTileProps, 'variant'> => {
  const { t } = useTranslation('account')

  const { isTaxForm, formDefinition, isEmbedded } = useFormContext()
  const { feedbackLink } = formDefinition

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
      content: t('FormSentPageContent.content.embedded'),
      isContentCentered: true,
    }
  }

  if (isTaxForm) {
    return {
      title: t('FormSentPageContent.title'),
      content: t('FormSentPageContent.content.tax'),
      primaryButton: feedbackButton,
      secondaryButton: municipalServicesButton,
    }
  }

  return {
    title: t('FormSentPageContent.title'),
    content: t('FormSentPageContent.content.generic'),
    isContentCentered: true,
    primaryButton: feedbackButton,
    secondaryButton: municipalServicesButton,
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
