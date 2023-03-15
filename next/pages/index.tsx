import { AsyncServerProps } from '@utils/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import PageWrapper from '../components/layouts/PageWrapper'

export const getStaticProps = async (ctx: { locale: string }) => {
  const locale: string = ctx.locale ?? 'sk'

  return {
    props: {
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
    },
  }
}

const Homepage = ({ page }: AsyncServerProps<typeof getStaticProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations} slug="">
      Temp - please go to /account
    </PageWrapper>
  )
}

export default Homepage
