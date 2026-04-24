import { Typography } from '@bratislava/component-library'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import Breadcrumbs, { BreadcrumbsProps } from '@/src/components/segments/Breadcrumbs/Breadcrumbs'

type Props = {
  title: string
} & BreadcrumbsProps

const TaxFeePageHeader = ({ title, breadcrumbs }: Props) => {
  return (
    <SectionContainer className="bg-gray-50 pb-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <Typography variant="h1">{title}</Typography>
      </div>
    </SectionContainer>
  )
}

export default TaxFeePageHeader
