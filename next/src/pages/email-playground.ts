import loadEmailTemplates from 'forms-shared/email-templates/loadEmailTemplates'
import path from 'path'

import EmailPlayground, { EmailPlaygroundProps } from '@/src/components/forms/EmailPlayground'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { environment } from '@/src/environment'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

/* Created by Claude */

export const getServerSideProps = amplifyGetServerSideProps<EmailPlaygroundProps>(async () => {
  if (!environment.featureToggles.developmentForms) {
    return { notFound: true }
  }

  const emailTemplatesDir = path.resolve(
    process.cwd(),
    '../forms-shared/src/email-templates/templates',
  )
  const templates = await loadEmailTemplates(emailTemplatesDir)

  return {
    props: {
      templates,
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(EmailPlayground)
