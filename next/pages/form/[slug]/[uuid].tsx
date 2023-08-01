import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition } from '@backend/utils/forms'
import { formsApi } from '@clients/forms'
import { GenericObjectType } from '@rjsf/utils'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import {
  getSSRAccessToken,
  getSSRCurrentAuth,
} from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'
import logger from '../../../frontend/utils/logger'
import { FormPageProps } from './index'

type Params = {
  slug: string
  uuid: string
}

export const getServerSideProps: GetServerSideProps<FormPageProps, Params> = async ({
  // locale is necessary for page wrappers common for entire web
  locale = 'sk',
  params,
  req,
}) => {
  if (!environment.featureToggles.forms || !params) {
    return { notFound: true }
  }

  const { slug, uuid } = params

  // TODO: Remove and support non-auth version of the page
  const ssrCurrentAuthProps = await getSSRCurrentAuth(req)
  if (!ssrCurrentAuthProps.userData) {
    return {
      redirect: {
        destination: '/prihlasenie',
        permanent: false,
      },
    }
  }

  let formDefinition: FormDefinition
  try {
    formDefinition = getFormDefinition(slug)
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  const accessToken = await getSSRAccessToken(req)
  const getInitialFormData = () => {
    return Promise.all([
      formsApi.nasesControllerGetForm(uuid, { accessToken }).then((res) => res.data),
      formsApi.filesControllerGetFilesStatusByForm(uuid, { accessToken }).then((res) => res.data),
    ] as const)
  }

  const [form, files] = await getInitialFormData()

  if (!form) {
    return { notFound: true }
  }

  return {
    props: {
      schema: formDefinition.schema,
      uiSchema: formDefinition.uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: form.id,
        formDataJson: form.formDataJson as GenericObjectType,
        files,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

// As far as we have same props as FormPage, we can just re-export it
export { default as FormUuidPage } from './index'
