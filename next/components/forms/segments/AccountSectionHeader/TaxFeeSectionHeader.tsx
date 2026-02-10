import Breadcrumbs, {
  BreadcrumbsProps,
} from '@/components/forms/segments/AccountSectionHeader/Breadcrumbs'

type TaxFeeSectionHeaderProps = {
  title: string
} & BreadcrumbsProps

const TaxFeeSectionHeader = ({ title, breadcrumbs }: TaxFeeSectionHeaderProps) => {
  return (
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-(--breakpoint-lg) flex-col gap-4 pb-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <h1 className="text-h1">{title}</h1>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
