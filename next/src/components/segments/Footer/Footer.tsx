import { useTranslation } from 'next-i18next'

import cn from '@/src/utils/cn'

type Props = {
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19566-30173&m=dev
 */

export const Footer = ({ className }: Props) => {
  const { t } = useTranslation('account')

  return (
    <footer
      className={cn(
        'border-t border-border-passive-primary bg-background-passive-primary py-4 lg:py-6',
        className,
      )}
    >
      <p className="text-center text-p2 text-content-passive-secondary">
        {t('Footer.text', { currentYear: new Date().getFullYear() })}
      </p>
    </footer>
  )
}

export default Footer
