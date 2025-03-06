import BALogo from '@assets/images/BALogo.svg'
import Button from 'components/forms/simple-components/ButtonNew'
import React from 'react'

import cn from '../../../frontend/cn'

export interface BrandProps {
  className?: string
  title?: React.ReactNode
  url?: string
}

const Brand = ({ className, title, url = '#' }: BrandProps) => {
  return (
    <div className={cn('flex', className)} aria-label="brand">
      <Button className="flex items-center space-x-3" href={url}>
        <BALogo className="size-8 lg:h-6" />
        {title && <div>{title}</div>}
      </Button>
    </div>
  )
}

export default Brand
