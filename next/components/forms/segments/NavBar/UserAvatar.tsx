import { ProfileIcon } from '@assets/ui-icons'
import { UserAttributes } from 'frontend/dtos/accountDto'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 * 
 * TODO Consolidate with similar component in user profile:
 *  https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21166-5210&t=EGiWvvrAjJLDEfQk-4
 */

const UserAvatar = ({ userAttributes }: { userAttributes?: UserAttributes | null }) => {
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

export default UserAvatar
