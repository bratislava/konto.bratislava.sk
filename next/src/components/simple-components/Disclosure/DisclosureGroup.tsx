import {
  DisclosureGroup as RACDisclosureGroup,
  DisclosureGroupProps as RACDisclosureGroupProps,
} from 'react-aria-components/DisclosureGroup'

import cn from '@/src/utils/cn'

interface DisclosureGroupProps extends RACDisclosureGroupProps {
  children: React.ReactNode
  className?: string
}

/*
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-14458&t=bZNhZEkp3fhBtj7v-4
 */

const DisclosureGroup = ({
  children,
  allowsMultipleExpanded = true,
  className,
  ...props
}: DisclosureGroupProps) => {
  return (
    <RACDisclosureGroup
      allowsMultipleExpanded={allowsMultipleExpanded}
      className={cn(
        'w-full rounded-lg border border-border-active-default bg-background-passive-base p-4',
        className,
      )}
      {...props}
    >
      {children}
    </RACDisclosureGroup>
  )
}

export default DisclosureGroup
