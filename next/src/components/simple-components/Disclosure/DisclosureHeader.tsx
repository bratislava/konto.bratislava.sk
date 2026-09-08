import { Button } from '@bratislava/component-library'
import { ReactNode, useContext } from 'react'
import { DisclosureStateContext as RACDisclosureStateContext } from 'react-aria-components/Disclosure'
import { Heading as RACHeading } from 'react-aria-components/Heading'

import Icon from '@/src/components/icon-components/Icon'
import { disclosureStyles } from '@/src/components/simple-components/Disclosure/disclosureStyles'
import { useDisclosureVariant } from '@/src/components/simple-components/Disclosure/DisclosureVariantContext'
import cn from '@/src/utils/cn'

interface DisclosureHeaderProps {
  children?: ReactNode
  className?: string
}

/**
 *  Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-14458&t=bZNhZEkp3fhBtj7v-4
 */

const DisclosureHeader = ({ children, className }: DisclosureHeaderProps) => {
  const { isExpanded } = useContext(RACDisclosureStateContext) ?? {}
  const variant = useDisclosureVariant()

  return (
    <RACHeading>
      <Button
        slot="trigger"
        variant="unstyled"
        className={cn('w-full text-left', disclosureStyles[variant].header, className)}
      >
        <div className="flex w-full justify-between">
          <div className="flex flex-1 flex-col gap-2">{children}</div>
          <Icon
            name="chevron-down"
            className={cn('self-center transition-transform duration-200 ease-in-out', {
              'rotate-180 transform': isExpanded,
            })}
          />
        </div>
      </Button>
    </RACHeading>
  )
}

export default DisclosureHeader
