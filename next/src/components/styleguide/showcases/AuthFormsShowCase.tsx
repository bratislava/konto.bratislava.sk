'use client'

import { useState } from 'react'

import EmailChangeForm from '@/src/components/auth-forms/EmailChangeForm'
import EmailVerificationForm from '@/src/components/auth-forms/EmailVerificationForm'
import ForgottenPasswordForm from '@/src/components/auth-forms/ForgottenPasswordForm'
import IdentityVerificationOfPhysicalEntityForm from '@/src/components/auth-forms/IdentityVerificationOfPhysicalEntityForm'
import IdentityVerificationOutageAlert from '@/src/components/auth-forms/IdentityVerificationOutageAlert'
import { LegalPersonVerificationPageContentBase } from '@/src/components/auth-forms/LegalPersonVerificationPageContent'
import LoginForm from '@/src/components/auth-forms/LoginForm'
import NewPasswordForm from '@/src/components/auth-forms/NewPasswordForm'
import PasswordChangeForm from '@/src/components/auth-forms/PasswordChangeForm'
import PhoneNumberForm from '@/src/components/auth-forms/PhoneNumberForm'
import RegisterForm from '@/src/components/auth-forms/RegisterForm'
import { VerificationStatus } from '@/src/components/auth-forms/useVerifyEid'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { Stack } from '@/src/components/styleguide/Stack'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { ErrorWithName } from '@/src/frontend/utils/errors'
import cn from '@/src/utils/cn'

import { Wrapper } from '../Wrapper'

const mockSubmit = async (...args: any[]) => {
  console.log('Form submitted with:', args)

  return Promise.resolve()
}

const mockAsyncOperation = async () => {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log('Async operation completed')
      resolve(null)
    }, 1000),
  )
}

const mockVerificationError = new ErrorWithName(
  'Unsuccessful identity verification',
  'unsuccessful-identity-verification',
)

const legalPersonVerificationStates: {
  label: string
  verificationStatus: VerificationStatus
  showSkipButton?: boolean
}[] = [
  { label: 'init', verificationStatus: VerificationStatus.INIT },
  {
    label: 'init without skip button',
    verificationStatus: VerificationStatus.INIT,
    showSkipButton: false,
  },
  { label: 'redirecting to slovensko.sk', verificationStatus: VerificationStatus.REDIRECTING },
  { label: 'verifying', verificationStatus: VerificationStatus.VERIFYING },
  { label: 'error', verificationStatus: VerificationStatus.ERROR },
]

const stackClassname = cn(
  'w-full items-stretch self-center rounded-none bg-background-passive-base lg:w-200 lg:p-8',
)

const AuthFormsContent = () => {
  const [lastEmail, setLastEmail] = useState('')
  const [phoneError, setPhoneError] = useState<Error | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <Wrapper direction="column" title="LoginForm">
        <Stack direction="column" className={stackClassname}>
          <LoginForm onSubmit={mockSubmit} />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="RegisterForm">
        <Stack direction="column" className={stackClassname}>
          <RegisterForm onSubmit={mockSubmit} />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="EmailVerificationForm">
        <Stack direction="column" className={stackClassname}>
          <EmailVerificationForm
            onSubmit={mockSubmit}
            onResend={mockAsyncOperation}
            lastEmail="user@example.com"
          />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="ForgottenPasswordForm">
        <Stack direction="column" className={stackClassname}>
          <ForgottenPasswordForm
            onSubmit={mockSubmit}
            lastEmail={lastEmail}
            setLastEmail={setLastEmail}
          />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="PasswordChangeForm">
        <Stack direction="column" className={stackClassname}>
          <PasswordChangeForm onSubmit={mockSubmit} />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="PhoneNumberForm">
        <Stack direction="column" className={stackClassname}>
          <PhoneNumberForm
            onSubmit={mockSubmit}
            error={phoneError}
            onHideError={() => setPhoneError(null)}
          />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="EmailChangeForm">
        <Stack direction="column" className={stackClassname}>
          <EmailChangeForm onSubmit={mockSubmit} />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="NewPasswordForm">
        <Stack direction="column" className={stackClassname}>
          <NewPasswordForm
            onSubmit={mockSubmit}
            onResend={mockAsyncOperation}
            lastEmail="user@example.com"
          />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="IdentityVerificationOfPhysicalEntityForm">
        <Stack direction="column" className={stackClassname}>
          <IdentityVerificationOfPhysicalEntityForm onSubmit={mockSubmit} />
        </Stack>
      </Wrapper>

      <Wrapper
        direction="column"
        title="IdentityVerificationOfPhysicalEntityForm - with error and outage alert"
      >
        <Stack direction="column" className={stackClassname}>
          <IdentityVerificationOfPhysicalEntityForm
            onSubmit={mockSubmit}
            error={mockVerificationError}
          />
        </Stack>
      </Wrapper>

      <Wrapper
        direction="column"
        title="IdentityVerificationPage - pending state with outage alert"
      >
        <Stack direction="column" className={stackClassname}>
          <AccountSuccessAlert
            variant="pending"
            title="Prebieha overovanie"
            description="Ospravedlňujeme sa za zdržanie. Rodné číslo a číslo dokladu ešte stále overujeme."
            confirmLabel="Pokračovať do konta"
            onConfirm={() => {}}
          >
            <IdentityVerificationOutageAlert />
          </AccountSuccessAlert>
        </Stack>
      </Wrapper>

      {legalPersonVerificationStates.map(({ label, verificationStatus, showSkipButton }) => (
        <Wrapper
          key={label}
          direction="column"
          title={`LegalPersonVerificationPageContent - ${label}`}
        >
          <Stack direction="column" className={stackClassname}>
            <LegalPersonVerificationPageContentBase
              verificationStatus={verificationStatus}
              onVerify={() => {}}
              showSkipButton={showSkipButton}
            />
          </Stack>
        </Wrapper>
      ))}
    </div>
  )
}

const AuthFormsShowCase = () => {
  return (
    <AmplifyClientOAuthProvider clientInfo={null}>
      <AuthFormsContent />
    </AmplifyClientOAuthProvider>
  )
}

export default AuthFormsShowCase
