import { ProfileIcon } from '@assets/ui-icons'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'

export const Avatar = () => {
  const { userAttributes } = useSsrAuth()

  return (
    <div className="relative flex flex-row items-start gap-2 rounded-full bg-main-100 p-2">
      <div className="flex size-6 items-center justify-center font-semibold text-main-700">
        <span className="uppercase">
          {userAttributes && userAttributes.given_name && userAttributes.family_name ? (
            userAttributes.given_name[0] + userAttributes.family_name[0]
          ) : (
            <ProfileIcon className="size-6 text-main-700" />
          )}
        </span>
      </div>
    </div>
  )
}

export default Avatar
