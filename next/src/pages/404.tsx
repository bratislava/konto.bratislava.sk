import { Button } from '@bratislava/component-library'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
}

const NotFoundPage = () => {
  const { t } = useTranslation('account')

  return (
    <div className="flex h-screen w-screen px-7 py-10 md:pr-32 md:pl-36 lg:pr-66 lg:pl-80">
      <div className="flex w-full flex-col items-center md:flex-row-reverse md:justify-between">
        <div className="relative h-[450px] w-[350px]">
          <Image alt="" src="/images/404.png" fill className="object-contain" />
        </div>
        <div className="flex shrink-0 flex-col items-center lg:items-start">
          {/* text-5xl font-extrabold does not work */}
          <div className="pb-4 text-[48px] font-[800] lg:text-[64px]">404</div>
          <div className="max-w-xs pb-10 text-center text-p1 lg:text-left">
            {t('404.sorryNoResultsFound')}
          </div>
          <Button href="/" hasLinkIcon={false} variant="solid">
            {t('404.toTheMainPage')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
