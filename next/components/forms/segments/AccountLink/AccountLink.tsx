import Button from 'components/forms/simple-components/Button'

interface Props {
  label: string
  description: string
  href: string
  variant?: 'black' | 'category'
}

const AccountLink = ({ description, label, href, variant = 'black' }: Props) => {
  return (
    <div className="flex flex-col justify-between md:flex-row">
      <div className="text-16-semibold text-gray-800">{description}</div>
      <Button size="sm" variant={`link-${variant}`} href={href} label={label} hrefIconHidden />
    </div>
  )
}

export default AccountLink
