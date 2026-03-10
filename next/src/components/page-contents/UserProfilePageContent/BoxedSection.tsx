import React from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'

interface UserProfileSectionProps {
  children?: React.ReactNode
}

const BoxedSection = ({ children }: UserProfileSectionProps) => {
  return (
    <SectionContainer className="bg-white md:py-3">
      <div className="flex flex-col items-center overflow-y-auto">
        <div className="w-full rounded-lg border-gray-200 md:border-2">{children}</div>
      </div>
    </SectionContainer>
  )
}

export default BoxedSection
