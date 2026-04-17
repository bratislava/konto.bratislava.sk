import { UserAttributes } from '@/src/frontend/dtos/accountDto'

type Props = {
  userAttributes: UserAttributes
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21166-5210&t=IZ8lRgxsaIokMNeg-4
 *
 * TODO Consolidate with UserAvatar - very similar usage and design
 */

const UserProfileDetailsPhoto = ({ userAttributes }: Props) => {
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
    <div className="flex size-[6.5rem] items-center justify-center rounded-full bg-background-passive-primary text-content-passive-primary lg:size-[10.5rem]">
      <span className="text-h2">{initialLetters.toUpperCase()}</span>
    </div>
  )
}

export default UserProfileDetailsPhoto
