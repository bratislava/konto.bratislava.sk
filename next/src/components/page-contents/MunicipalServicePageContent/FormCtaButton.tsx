import { Button } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { formsClient } from '@/src/clients/forms'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  formDefinition: ClientLandingPageFormDefinition
  buttonLabel?: string | null
}

const FormCtaButton = ({ buttonLabel, formDefinition }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()

  const { showToast, closeToasts } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      formsClient.formsV2ControllerCreateForm(
        {
          formDefinitionSlug: formDefinition.slug,
        },
        { authStrategy: 'authOrGuestWithToken' },
      ),
    networkMode: 'always',
    onMutate: () => {
      showToast({
        message: t('FormLandingPageCtaCard.redirectInfo'),
        variant: 'info',
        // Keep this toast visible for the whole redirect flow; it is closed explicitly after navigation succeeds.
        duration: Number.MAX_SAFE_INTEGER,
      })
    },
    onSuccess: async (response) => {
      await router.push(
        ROUTES.MUNICIPAL_SERVICES_FORM_WITH_ID(formDefinition.slug, response.data.formId),
      )
      // Close the redirect toast only after a successful route change so it stays visible until the user is redirected.
      closeToasts()
    },
    onError: () => {
      showToast({ message: t('FormLandingPageCtaCard.redirectError'), variant: 'error' })
    },
  })

  return (
    <Button
      variant="solid"
      fullWidth
      onPress={() => {
        mutate()
      }}
      isLoading={isPending}
      data-cy="form-cta-button"
    >
      {buttonLabel ?? t('FormCtaButton.fillFormButtonLabel')}
    </Button>
  )
}

export default FormCtaButton
