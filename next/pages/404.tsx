import { ArrowRightIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/Button'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}

const NotFoundPage = () => {
  const { t } = useTranslation('common')

  return (
    <div className="flex h-screen w-screen px-7 py-10 md:pl-36 md:pr-32 xl:pl-80 xl:pr-66">
      <div className="flex w-full flex-col items-center md:flex-row-reverse md:justify-between">
        <div className="relative h-[450px] w-[350px]">
          <Image alt="" src="/images/404.png" fill className="object-contain" />
        </div>
        <div className="flex shrink-0 flex-col items-center lg:items-start">
          {/* text-5xl font-extrabold does not work */}
          <div className="pb-4 text-[48px] font-[800] lg:text-[64px]">404</div>
          <div className="text-p1 max-w-xs pb-10 text-center lg:text-left">
            {t('sorryNoResultsFound')}
          </div>
          <Link href="/">
            <Button text={t('toTheMainPage')} endIcon={<ArrowRightIcon className="h-6 w-6" />} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
