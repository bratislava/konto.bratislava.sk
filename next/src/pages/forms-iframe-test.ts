import { formDefinitions } from 'forms-shared/definitions/formDefinitions'

import FormsIframeTestPage, {
  FormsIframeTestPageProps,
} from '@/src/components/forms/FormsIframeTestPage'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { environment } from '@/src/environment'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps<FormsIframeTestPageProps>(async () => {
  if (!environment.featureToggles.developmentForms) {
    return { notFound: true }
  }

  const embeddedForms = formDefinitions
    .filter((form) => form.embedded)
    .map((form) => ({ title: form.title, slug: form.slug }))

  return {
    props: {
      embeddedForms,
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(FormsIframeTestPage)
