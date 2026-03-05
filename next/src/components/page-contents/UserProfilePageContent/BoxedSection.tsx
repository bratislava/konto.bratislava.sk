import React from 'react'

interface UserProfileSectionProps {
  children?: React.ReactNode
}

const BoxedSection = ({ children }: UserProfileSectionProps) => {
  return (
    <div className="flex grow flex-col items-center overflow-y-auto bg-white md:px-8 md:py-3">
      <div className="w-full max-w-(--breakpoint-xl) rounded-lg px-4 lg:px-8">
        <div className="rounded-lg border-gray-200 md:border-2">{children}</div>
      </div>
    </div>
  )
}

export default BoxedSection
