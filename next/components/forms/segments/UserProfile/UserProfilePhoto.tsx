import { UserAttributes } from '@/frontend/dtos/accountDto'

interface UserProfilePhotoProps {
  userAttributes: UserAttributes
}

const UserProfilePhoto = ({ userAttributes }: UserProfilePhotoProps) => {
  const { given_name, family_name, email, name } = userAttributes
  const initialLetters =
    given_name || family_name
      ? (given_name ? given_name.slice(0, 1) : '') + (family_name ? family_name.slice(0, 1) : '')
      : name
        ? name.slice(0, 1)
        : email
          ? email.slice(0, 1)
          : ''

  return (
    <div className="flex h-24 w-24 min-w-24 flex-col items-center justify-center rounded-full bg-main-100 text-main-700 md:h-[168px] md:w-[168px] md:min-w-[168px]">
      <span className="text-p1-semibold md:text-h2">{initialLetters.toUpperCase()}</span>
    </div>
  )
}

export default UserProfilePhoto
