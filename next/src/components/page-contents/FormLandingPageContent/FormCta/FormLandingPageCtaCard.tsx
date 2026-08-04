import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { formsClient } from '@/src/clients/forms'
import { FormLandingPageFormCtaFragment } from '@/src/clients/graphql-strapi/api'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import FormLandingPageCard from '@/src/components/segments/FormLandingPageCard/FormLandingPageCard'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  formCta: FormLandingPageFormCtaFragment
  formDefinition: ClientLandingPageFormDefinition
}

const FormLandingPageCtaCard = ({ formCta, formDefinition }: Props) => {
  const router = useRouter()
  const { t } = useTranslation('account')
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
        message: t('forms.form_landing_page.redirect_info'),
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
      showToast({ message: t('forms.form_landing_page.redirect_error'), variant: 'error' })
    },
  })

  return (
    <FormLandingPageCard
      {...formCta}
      isLoading={isPending}
      onPress={() => {
        mutate()
      }}
    />
  )
}

export default FormLandingPageCtaCard
