import React from 'react'

interface UserProfileSectionProps {
  children?: React.ReactNode
}

const UserProfileSection = ({ children }: UserProfileSectionProps) => {
  return (
    <div className="flex grow flex-col items-center overflow-y-auto bg-white md:px-8 md:py-3">
      <div className="md:max-w-(--breakpoint-lg) w-full rounded-lg border-gray-200 md:border-2">
        {children}
      </div>
    </div>
  )
}

export default UserProfileSection
