import { ProfileIcon } from '@assets/ui-icons'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'

export const Avatar = () => {
  const { userData } = useSsrAuth()

  return (
    <div className="relative flex flex-row items-start gap-2 rounded-full bg-main-100 p-2">
      <div className="flex h-6 w-6 items-center justify-center font-semibold text-main-700">
        <span className="uppercase">
          {userData && userData.given_name && userData.family_name ? (
            userData.given_name[0] + userData.family_name[0]
          ) : (
            <ProfileIcon className="h-6 w-6 text-main-700" />
          )}
        </span>
      </div>
    </div>
  )
}

export default Avatar
