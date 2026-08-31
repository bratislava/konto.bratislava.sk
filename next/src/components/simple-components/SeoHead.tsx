import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { getSelfUrl } from '@/src/utils/getSelfUrl'

type SeoHeadProps = {
  title?: string | null
  ogType?: string
  description?: string | null
}

/**
 * Inspired by OLO: https://github.com/bratislava/olo.sk/blob/master/next/src/components/common/SeoHead/SeoHead.tsx
 */

const SeoHead = ({ title, ogType = 'website', description }: SeoHeadProps) => {
  const { t } = useTranslation()
  const { asPath } = useRouter()

  const fullUrl = `${getSelfUrl()}${asPath}`

  const metaTitle = `${title || ''} – ${t('common.bratislavaAccount')}`

  return (
    <Head>
      <title>{`${title || ''} – ${t('common.bratislavaAccount')}`}</title>

      <meta name="title" content={metaTitle} />
      <meta name="description" content={description || ''} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {fullUrl ? <link rel="canonical" href={fullUrl} /> : null}

      {/* Documentation: https://ogp.me/ */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:type" content={ogType} />
      {fullUrl ? <meta property="og:url" content={fullUrl} /> : null}

      {/* TODO: Twitter's image size limit is only 1MB */}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Comments from: https://css-tricks.com/essential-meta-tags-social-media/ */}
      {/* Non-Essential, But Recommended */}
      <meta property="og:description" content={description || ''} />
      <meta property="og:site_name" content={t('common.bratislavaAccount')} />

      {/* Non-Essential, But Required for Analytics */}
      <meta property="fb:app_id" content="your_app_id" />
      <meta name="twitter:site" content="@website-username" />
    </Head>
  )
}

export default SeoHead
