import { Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'

interface StyleGuideWrapperProps {
  children: ReactNode
}

const StyleGuideWrapper = ({ children }: StyleGuideWrapperProps) => {
  return (
    <main>
      <SectionContainer className="min-h-[calc(100vh+1px)] bg-[#E5E5E5] pb-64 md:pt-12">
        <Typography variant="h1" className="mb-10 text-center underline">
          Style Guide
        </Typography>
        {children}
      </SectionContainer>
    </main>
  )
}

export default StyleGuideWrapper
