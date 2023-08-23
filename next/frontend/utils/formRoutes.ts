import { formsApi } from '@clients/forms'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { isAxiosError } from 'axios'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { FormPageWrapperProps } from '../../components/forms/FormPageWrapper'
import { getSSRCurrentAuth } from '../../components/logic/ServerSideAuthProvider'
import { ROUTES } from '../api/constants'

export const existingFormServerSideProps = async (
  ctx: GetServerSidePropsContext,
  slug: string,
  formId: string,
): Promise<GetServerSidePropsResult<FormPageWrapperProps>> => {
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  try {
    const [form, files] = await Promise.all([
      formsApi
        .nasesControllerGetForm(formId, {
          accessToken: 'onlyAuthenticated',
          accessTokenSsrReq: ctx.req,
        })
        .then((res) => res.data),
      formsApi
        .filesControllerGetFilesStatusByForm(formId, {
          accessToken: 'onlyAuthenticated',
          accessTokenSsrReq: ctx.req,
        })
        .then((res) => res.data),
    ])

    if (
      !form ||
      /* If there wouldn't be this check it would be possible to open the page with any slug in the URL. */
      form.schemaVersion.schema?.slug !== slug
    ) {
      return { notFound: true }
    }

    const formSent = form.state !== GetFormResponseDtoStateEnum.Draft
    const locale = 'sk'

    return {
      props: {
        schema: form.schemaVersion.jsonSchema,
        uiSchema: form.schemaVersion.uiSchema,
        ssrCurrentAuthProps,
        page: {
          locale,
        },
        initialFormData: {
          formId,
          formDataJson: form.formDataJson ?? {},
          files,
          oldSchemaVersion: !form.isLatestSchemaVersionForSlug,
          formSent,
          routeWithId: true,
        },
        ...(await serverSideTranslations(locale)),
      } satisfies FormPageWrapperProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { notFound: true }
      }
      if (error.response?.status === 401) {
        return {
          redirect: {
            destination: '/prihlasenie',
            permanent: false,
          },
        }
      }
    }

    throw error
  }
}

export const createFormServerSideProps = async (
  ctx: GetServerSidePropsContext,
  slug: string,
): Promise<GetServerSidePropsResult<FormPageWrapperProps>> => {
  if (ctx.query.formId && typeof ctx.query.formId === 'string') {
    return {
      redirect: {
        destination: `${ROUTES.MUNICIPAL_SERVICES}/${slug}/${ctx.query.formId}?fromSendEid=true`,
        permanent: false,
      },
    }
  }

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  try {
    const schema = await formsApi.schemasControllerGetSchema(slug, {
      accessToken: 'onlyAuthenticated',
      accessTokenSsrReq: ctx.req,
    })
    console.log('latestVersionId', schema.data.latestVersionId)
    const { latestVersionId, latestVersion } = schema.data
    if (!latestVersionId || !latestVersion) {
      return {
        notFound: true,
      }
    }

    const form = await formsApi
      .nasesControllerCreateForm(
        {
          schemaVersionId: latestVersionId,
        },
        { accessToken: 'onlyAuthenticated', accessTokenSsrReq: ctx.req },
      )
      .then((res) => res.data)

    if (!form) {
      return { notFound: true }
    }

    // TODO: Consider keeping this
    if (ssrCurrentAuthProps.userData) {
      return {
        redirect: {
          destination: `/mestske-sluzby/${slug}/${form.id}`,
          permanent: false,
        },
      }
    }

    const formSent = form.state !== GetFormResponseDtoStateEnum.Draft
    // necessary for page wrappers common for entire web
    const locale = ctx.locale ?? 'sk'

    return {
      props: {
        schema: latestVersion.jsonSchema,
        uiSchema: latestVersion.uiSchema,
        ssrCurrentAuthProps,
        page: {
          locale,
        },
        initialFormData: {
          formId: form.id,
          formDataJson: form.formDataJson ?? {},
          files: [],
          // Uncomment when BE fixes https://github.com/bratislava/konto.bratislava.sk/issues/428
          // eslint-disable-next-line no-secrets/no-secrets
          // oldSchemaVersion: !form.isLatestSchemaVersionForSlug,
          oldSchemaVersion: false,
          formSent,
          routeWithId: false,
        },
        ...(await serverSideTranslations(locale)),
      } satisfies FormPageWrapperProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { notFound: true }
      }
      if (error.response?.status === 401) {
        return {
          redirect: {
            destination: '/prihlasenie',
            permanent: false,
          },
        }
      }
    }

    throw error
  }
}
