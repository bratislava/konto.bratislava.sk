import AccountMarkdown from '@/components/forms/segments/AccountMarkdown/AccountMarkdown'
import Toggle from '@/components/forms/simple-components/Toggle'

interface Consent {
  id: string
  title: string
  text: string
  isDisabled: boolean
  isSelected: boolean
}

interface UserConsentProps {
  consent: Consent
  onChange: (isSelected: boolean) => void
}

const UserConsent = ({ consent, onChange }: UserConsentProps) => {
  return (
    <div
      className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:py-6"
      data-cy={`${consent.id.replaceAll('_', '-')}-consent`}
    >
      <div className="flex w-full grow flex-col gap-2">
        <h3 className="text-h5">{consent.title}</h3>
        {/* TODO remove custom spacing by gap-1 */}
        <AccountMarkdown variant="sm" content={consent.text} className="gap-1" />
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
