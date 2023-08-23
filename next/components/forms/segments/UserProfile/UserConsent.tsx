import cx from 'classnames'
import Toggle from 'components/forms/simple-components/Toggle'

interface Consent {
  id: string
  title: string
  text: string
  isDisabled: boolean
  isSelected: boolean
}

interface UserConsentProps {
  consent: Consent
  isLast?: boolean
  onChange: (isSelected: boolean) => void
}

const UserConsent = ({ consent, isLast, onChange }: UserConsentProps) => {
  return (
    <div
      className={cx('flex flex-col gap-4 border-gray-200 py-4', 'sm:flex-row sm:py-6', {
        'border-b-2': !isLast,
      })}
    >
      <div className="w-full grow">
        <h5 className="text-h6">{consent.title}</h5>
        <p className="text-p2-normal">{consent.text}</p>
      </div>
      <div>
        <Toggle
          id={consent.id}
          isSelected={consent.isSelected}
          isDisabled={consent.isDisabled}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default UserConsent
