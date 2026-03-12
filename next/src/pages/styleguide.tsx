import { ReactElement, useState } from 'react'
import { Key, Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { StatusBar } from '@/src/components/simple-components/StatusBar'
import SnackbarShowCase from '@/src/components/styleguide/showcases/SnackbarShowCase'
import ToastShowCase from '@/src/components/styleguide/showcases/ToastShowCase'
import StyleGuideWrapper from '@/src/components/styleguide/StyleGuideWrapper'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isProductionDeployment } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

const showcases = [
  { id: 'snackbar', label: 'Snackbar', component: <SnackbarShowCase /> },
  { id: 'toast', label: 'Toast', component: <ToastShowCase /> },
] satisfies { id: string; label: string; component: ReactElement }[]

const StyleguidePage = () => {
  const [selectedKey, setSelectedKey] = useState<Key>(showcases[0].id)

  return (
    <>
      <StatusBar />

      <StyleGuideWrapper>
        <Tabs
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
          className="mb-10 flex flex-col"
        >
          <TabList className="flex flex-wrap gap-2 pb-4">
            {showcases.map(({ id, label }) => (
              <Tab
                key={id}
                id={id}
                className="data-selected:border-gray-700 data-selected:bg-gray-100 data-selected:font-semibold cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50"
              >
                {label}
              </Tab>
            ))}
          </TabList>
          {showcases.map(({ id, component }) => (
            <TabPanel key={id} id={id}>
              {component}
            </TabPanel>
          ))}
        </Tabs>
      </StyleGuideWrapper>
    </>
  )
}

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  if (isProductionDeployment()) return { notFound: true }

  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(StyleguidePage)
