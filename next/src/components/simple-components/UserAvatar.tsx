import { Typography } from '@bratislava/component-library'

import Icon from '@/src/components/icon-components/Icon'
import { UserAttributes } from '@/src/frontend/dtos/accountDto'
import cn from '@/src/utils/cn'

/**
 * Figma - navBar: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 * Figma - useDetails: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21166-5210&t=IZ8lRgxsaIokMNeg-4
 */

type Props = {
  userAttributes?: UserAttributes | null
  variant?: 'navBar' | 'userDetails'
}

const UserAvatar = ({ userAttributes, variant = 'navBar' }: Props) => {
  const { given_name, family_name } = userAttributes ?? {}

  const initialLetters =
    given_name?.length && family_name?.length ? `${given_name[0]}${family_name[0]}` : undefined

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-background-passive-primary font-semibold text-content-passive-primary',
        {
          'size-10': variant === 'navBar',
          'size-26 lg:size-42': variant === 'userDetails',
        },
      )}
    >
      <Typography
        variant={variant === 'userDetails' ? 'h2' : 'p-small'}
        as="span"
        className="uppercase"
      >
        {initialLetters ?? <Icon name="user" className="size-6" />}
      </Typography>
    </div>
  )
}

export default UserAvatar
