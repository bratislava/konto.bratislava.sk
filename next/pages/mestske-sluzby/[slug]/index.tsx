import { GetServerSideProps } from 'next'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { ServerSideAuthProviderHOC } from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'
import {
  createFormServerSideProps,
  existingFormServerSideProps,
} from '../../../frontend/utils/formRoutes'

type Params = {
  slug: string
}

export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug } = ctx.params

  const { formId } = ctx.query
  if (typeof formId === 'string') {
    return existingFormServerSideProps(ctx, slug, formId)
  }

  return createFormServerSideProps(ctx, slug)
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
