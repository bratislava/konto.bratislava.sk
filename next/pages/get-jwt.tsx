import { Wrapper } from 'components/styleguide/Wrapper'
import React from 'react'

import ClipboardCopy from '../components/forms/simple-components/ClipboardCopy'
// import { resetRcApi } from '../frontend/api/api'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type GetJwtProps = {
  accessToken: string | null
}

export const getServerSideProps = amplifyGetServerSideProps<GetJwtProps>(
  async ({ getAccessToken }) => {
    return {
      props: {
        ...(await slovakServerSideTranslations()),
        accessToken: await getAccessToken(),
      },
    }
  },
  { requiresSignIn: true, skipSsrAuthContext: true },
)

const GetJwt = ({ accessToken }: GetJwtProps) => {
  // resetting the birth number was not used for some time - if needed, this needs to be updated
  // const resetRc = async () => {
  //   try {
  //     await resetRcApi()
  // reset the birth number in cognito data here!
  //     alert(`Res: ${JSON.stringify(res)}`)
  //   } catch (error) {
  //     logger.error(error)
  //     alert(`ERROR`)
  //   }
  // }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      <div className="max-w-(--breakpoint-lg) mx-auto pb-64 md:px-12 md:pt-12">
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
