import BALogo from '@assets/images/BALogo.svg'
import cx from 'classnames'
import Button from 'components/forms/simple-components/ButtonNew'
import React from 'react'

export interface BrandProps {
  className?: string
  title?: React.ReactNode
  url?: string
}

const Brand = ({ className, title, url = '#' }: BrandProps) => {
  return (
    <div className={cx('flex', className)} aria-label="brand">
      <Button className="flex items-center space-x-3" href={url}>
        <BALogo className="h-8 w-8 lg:h-6" />
        {title && <div>{title}</div>}
      </Button>
    </div>
  )
}

export default Brand
