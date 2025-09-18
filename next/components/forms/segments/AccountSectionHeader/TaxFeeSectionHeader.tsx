import Breadcrumbs from './Breadcrumbs'

type TaxFeeSectionHeaderProps = {
  title: string
  navigationItems: {
    title: string
    path: string | null
  }[]
}
const TaxFeeSectionHeader = ({ title, navigationItems }: TaxFeeSectionHeaderProps) => {
  return (
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-(--breakpoint-lg) flex-col gap-4 py-6">
        <div className="flex flex-col">
          <Breadcrumbs breadcrumbs={navigationItems} />
        </div>
        <div className="flex size-full flex-col items-start gap-2">
          <div className="flex size-full flex-col items-start gap-4">
            <div className="flex w-full flex-row items-center gap-4">
              <div className="grow text-h1">{title}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
