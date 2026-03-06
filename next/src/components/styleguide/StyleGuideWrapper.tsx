import * as React from 'react'
import { ReactNode } from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'

interface StyleGuideWrapperProps {
  children: ReactNode
}

const StyleGuideWrapper = ({ children }: StyleGuideWrapperProps) => {
  return (
    <main>
      <SectionContainer className="min-h-[calc(100vh+1px)] bg-[#E5E5E5] pb-64 md:pt-12">
        <h1 className="mb-10 text-center text-h1 underline">Style Guide</h1>
        {children}
      </SectionContainer>
    </main>
  )
}

export default StyleGuideWrapper
