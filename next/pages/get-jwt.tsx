import { Wrapper } from 'components/styleguide/Wrapper'
import React from 'react'

import ClipboardCopy from '../components/forms/simple-components/ClipboardCopy'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type GetJwtProps = {
  accessToken: string | null
}

export const getServerSideProps = amplifyGetServerSideProps<GetJwtProps>(
  async ({ fetchAuthSession }) => {
    const authSession = await fetchAuthSession()
    if (!authSession.tokens) {
      throw new Error("Route passed `requiresSignIn` even if it shouldn't have.")
    }

    const accessToken = authSession.tokens.accessToken.toString()

    return {
      props: {
        ...(await slovakServerSideTranslations()),
        accessToken,
      },
    }
  },
  { requiresSignIn: true, skipSsrAuthContext: true },
)

const GetJwt = ({ accessToken }: GetJwtProps) => {
  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      <div className="mx-auto max-w-(--breakpoint-lg) pb-64 md:px-12 md:pt-12">
        <Wrapper
          direction="column"
          title="Kód nižšie slúži na technické účely a umožňuje prístup k Vášmu kontu. NIKDY HO S NIKÝM NEZDIEĽAJTE. This site is for development purposes, the code below allows anyone to access your account. NEVER SHARE IT WITH ANYONE."
        >
          <div className="flex flex-col break-all">
            {accessToken} {accessToken && <ClipboardCopy copyText={accessToken} />}
          </div>
        </Wrapper>
      </div>
    </div>
  )
}

export default GetJwt
