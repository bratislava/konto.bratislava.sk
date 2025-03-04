import { ProfileIcon } from '@assets/ui-icons'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'

export const Avatar = () => {
  const { userAttributes } = useSsrAuth()

  return (
    <div className="bg-main-100 relative flex flex-row items-start gap-2 rounded-full p-2">
      <div className="text-main-700 flex size-6 items-center justify-center font-semibold">
        <span className="uppercase">
          {userAttributes && userAttributes.given_name && userAttributes.family_name ? (
            userAttributes.given_name[0] + userAttributes.family_name[0]
          ) : (
            <ProfileIcon className="text-main-700 size-6" />
          )}
        </span>
      </div>
    </div>
  )
}

export default Avatar
