import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import BALogo from '@/src/assets/images/BALogo.svg'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

export interface BrandProps {
  variant: 'header' | 'footer'
  unlinked?: boolean
  className?: string
}

const Brand = ({ variant, className, unlinked }: BrandProps) => {
  const { t } = useTranslation('account')

  const href = unlinked ? undefined : ROUTES.HOME

  const title = (() => {
    switch (variant) {
      case 'header':
        return (
          <Typography variant="p-small" className="text-content-active-primary-default">
            {t('Brand.cityAccount')}
          </Typography>
        )

      case 'footer':
        return (
          <Typography variant="p-small" className="text-[#F23005]">
            {t('Brand.cityOfBratislava')}
          </Typography>
        )

      default:
        return null
    }
  })()

  const content = (
    <>
      <BALogo className="size-8 lg:h-6" />
      {title && <div>{title}</div>}
    </>
  )

  return (
    <div className={cn('flex', className)} aria-label="brand">
      {href ? (
        <Button
          variant="unstyled"
          className="flex items-center gap-x-3 hover:opacity-80"
          href={href}
          hasLinkIcon={false}
        >
          {content}
        </Button>
      ) : (
        <div className="flex items-center gap-x-3">{content}</div>
      )}
    </div>
  )
}

export default Brand
