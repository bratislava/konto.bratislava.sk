import { GetServerSideProps } from 'next'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { ServerSideAuthProviderHOC } from '../../../components/logic/ServerSideAuthProvider'
import { environment } from '../../../environment'
import { existingFormServerSideProps } from '../../../frontend/utils/formRoutes'

type Params = {
  slug: string
  id: string
}

export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.forms || !ctx.params) return { notFound: true }

  const { slug, id } = ctx.params

  return existingFormServerSideProps(ctx, slug, id)
}

export default ServerSideAuthProviderHOC(FormPageWrapper)
