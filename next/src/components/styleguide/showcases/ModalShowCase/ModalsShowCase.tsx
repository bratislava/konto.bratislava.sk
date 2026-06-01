import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import FormProviders from '@/src/components/forms/FormProviders'
import { FormContextProvider } from '@/src/components/forms/useFormContext'
import { FormSentProvider } from '@/src/components/forms/useFormSent'
import { mockFormServerContext } from '@/src/components/styleguide/utils/mockFormServerContext'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

import BaseModalsShowcase from './BaseModalsShowcase'
import FormMessageModalsShowcase from './FormMessageModalsShowcase'
import IdentityVerificationShowcase from './IdentityVerificationShowcase'
import OfficialCorrespondenceChannelShowcase from './OfficialCorrespondenceChannelShowcase'
import RegistrationShowcase from './RegistrationShowcase'
import TaxFormPdfExportShowcase from './TaxFormPdfExportShowcase'

/**
 * Some modals are missing here
 * - PhoneNumberModal (not used in production)
 */

const modalShowcaseTabs = [
  { id: 'base', label: 'Base Modals' },
  { id: 'form-message-modals', label: 'Form Message Modals' },
  { id: 'tax-form-pdf-export', label: 'Tax form PDF export' },
  { id: 'identity-verification', label: 'Identity verification' },
  { id: 'registration', label: 'Registration' },
  { id: 'official-correspondence-channel', label: 'Official correspondence channel' },
] as const

const ModalShowCaseContent = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'modal',
    parseAsString.withDefault(modalShowcaseTabs[0].id),
  )

  return (
    <Wrapper direction="column" title="Modals">
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={(value) => setSelectedKey(value.toString())}
        className="flex flex-col gap-4"
      >
        <TabList className="flex flex-wrap gap-2">
          {modalShowcaseTabs.map(({ id, label }) => (
            <Tab
              key={id}
              id={id}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
            >
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanel id="base">
          <BaseModalsShowcase />
        </TabPanel>

        <TabPanel id="form-message-modals">
          <FormMessageModalsShowcase />
        </TabPanel>

        <TabPanel id="tax-form-pdf-export">
          <TaxFormPdfExportShowcase />
        </TabPanel>

        <TabPanel id="identity-verification">
          <IdentityVerificationShowcase />
        </TabPanel>

        <TabPanel id="registration">
          <RegistrationShowcase />
        </TabPanel>

        <TabPanel id="official-correspondence-channel">
          <OfficialCorrespondenceChannelShowcase />
        </TabPanel>
      </Tabs>
    </Wrapper>
  )
}

const ModalShowCase = () => {
  const mockedFormServerContext = mockFormServerContext()

  return (
    <FormContextProvider formServerContext={mockedFormServerContext}>
      <FormSentProvider initialFormSent={mockedFormServerContext.initialFormSent}>
        <FormProviders>
          <ModalShowCaseContent />
        </FormProviders>
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default ModalShowCase
