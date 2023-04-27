// registration / verification status

import React from 'react'

export enum OnboardingStatus {
  Idle,
  NewPasswordRequired,
  NewPasswordSuccess,
  EmailVerificationRequired,
  EmailVerificationSuccess,
  IdentityVerificationRequired,
  IdentityVerificationPending,
  IdentityVerificationFailed,
  IdentityVerificationSuccess,
}

interface OnboardingState {
  status: OnboardingStatus
}

const OnboardingContext = React.createContext<OnboardingState>({} as OnboardingState)

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = React.useState<OnboardingStatus>(OnboardingStatus.Idle)

  return <OnboardingContext.Provider value={{ status }}>{children}</OnboardingContext.Provider>
}

export default function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within a OnboardingProvider')
  }
  return context
}
