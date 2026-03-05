import Breadcrumbs, { BreadcrumbsProps } from '@/src/components/segments/Breadcrumbs/Breadcrumbs'

type Props = {
  title: string
} & BreadcrumbsProps

const TaxFeePageHeader = ({ title, breadcrumbs }: Props) => {
  return (
    <div className="h-full bg-gray-50">
      <div className="m-auto flex max-w-(--breakpoint-xl) flex-col gap-4 px-4 pb-8 lg:px-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <h1 className="text-h1">{title}</h1>
      </div>
    </div>
  )
}

export default TaxFeePageHeader
