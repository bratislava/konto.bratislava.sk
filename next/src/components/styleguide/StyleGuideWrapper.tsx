import * as React from 'react'
import { ReactNode } from 'react'

interface StyleGuideWrapperProps {
  children: ReactNode
}

const StyleGuideWrapper = ({ children }: StyleGuideWrapperProps) => {
  return (
    <main>
      <div className="min-h-[calc(100vh+1px)] bg-[#E5E5E5]">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 pb-64 md:pt-12 lg:px-8">
          <h1 className="mb-10 text-center text-h1 underline">Style Guide</h1>
          {children}
        </div>
      </div>
    </main>
  )
}

export default StyleGuideWrapper
