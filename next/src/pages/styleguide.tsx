import { ReactElement, useState } from 'react'
import { Key, Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { StatusBar } from '@/src/components/simple-components/StatusBar'
import AccordionShowCase from '@/src/components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '@/src/components/styleguide/showcases/AlertShowCase'
import BannerShowCase from '@/src/components/styleguide/showcases/BannerShowCase'
import ButtonShowCase from '@/src/components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '@/src/components/styleguide/showcases/CheckboxGroupShowCase'
import DatePickerShowCase from '@/src/components/styleguide/showcases/DatePickerShowCase'
import FieldHeaderShowCase from '@/src/components/styleguide/showcases/FieldHeaderShowCase'
import IconShowCase from '@/src/components/styleguide/showcases/IconShowCase'
import InputFieldShowCase from '@/src/components/styleguide/showcases/InputFieldShowCase'
import ModalShowCase from '@/src/components/styleguide/showcases/ModalShowCase'
import MyApplicationsCardShowCase from '@/src/components/styleguide/showcases/MyApplicationsCardShowCase'
import ProgressBarShowCase from '@/src/components/styleguide/showcases/ProgressBarShowCase'
import RadioGroupShowCase from '@/src/components/styleguide/showcases/RadioGroupShowCase'
import SearchFieldShowCase from '@/src/components/styleguide/showcases/SearchFieldShowCase'
import SelectMultiNewShowCase from '@/src/components/styleguide/showcases/SelectFieldShowCase'
import ServiceCardShowCase from '@/src/components/styleguide/showcases/ServiceCardShowCase'
import SnackbarShowCase from '@/src/components/styleguide/showcases/SnackbarShowCase'
import SpinnerShowCase from '@/src/components/styleguide/showcases/SpinnerShowCase'
import SummaryRowShowCase from '@/src/components/styleguide/showcases/SummaryRowShowCase'
import TagShowCase from '@/src/components/styleguide/showcases/TagShowCase'
import TextAreaFieldShowCase from '@/src/components/styleguide/showcases/TextAreaFieldShowCase'
import TimePickerShowCase from '@/src/components/styleguide/showcases/TimePickerShowCase'
import ToggleShowCase from '@/src/components/styleguide/showcases/ToggleShowCase'
import TooltipShowCase from '@/src/components/styleguide/showcases/TooltipShowCase'
import UploadShowCase from '@/src/components/styleguide/showcases/UploadShowCase'
import StyleGuideWrapper from '@/src/components/styleguide/StyleGuideWrapper'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isProductionDeployment } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

const showcases = [
  { id: 'button', label: 'Button', component: <ButtonShowCase /> },
  {
    id: 'modal',
    label: 'Modal',
    component: <ModalShowCase />,
  },
  { id: 'icon', label: 'Icon', component: <IconShowCase /> },
  { id: 'tag', label: 'Tag', component: <TagShowCase /> },
  { id: 'tooltip', label: 'Tooltip', component: <TooltipShowCase /> },
  { id: 'field-header', label: 'Field Header', component: <FieldHeaderShowCase /> },
  { id: 'spinner', label: 'Spinner', component: <SpinnerShowCase /> },
  { id: 'input-field', label: 'Input Field', component: <InputFieldShowCase /> },
  { id: 'date-picker', label: 'Date Picker', component: <DatePickerShowCase /> },
  { id: 'time-picker', label: 'Time Picker', component: <TimePickerShowCase /> },
  { id: 'text-area-field', label: 'Text Area Field', component: <TextAreaFieldShowCase /> },
  { id: 'search-field', label: 'Search Field', component: <SearchFieldShowCase /> },
  { id: 'select', label: 'Select', component: <SelectMultiNewShowCase /> },
  { id: 'toggle', label: 'Toggle', component: <ToggleShowCase /> },
  { id: 'alert', label: 'Alert', component: <AlertShowCase /> },
  { id: 'upload', label: 'Upload', component: <UploadShowCase /> },
  { id: 'accordion', label: 'Accordion', component: <AccordionShowCase /> },
  { id: 'progress-bar', label: 'Progress Bar', component: <ProgressBarShowCase /> },
  { id: 'checkbox-group', label: 'Checkbox Group', component: <CheckboxGroupShowCase /> },
  { id: 'radio-group', label: 'Radio Group', component: <RadioGroupShowCase /> },
  { id: 'summary-row', label: 'Summary Row', component: <SummaryRowShowCase /> },
  { id: 'banner', label: 'Banner', component: <BannerShowCase /> },
  { id: 'service-card', label: 'Service Card', component: <ServiceCardShowCase /> },
  {
    id: 'my-applications-card',
    label: 'My Applications Card',
    component: <MyApplicationsCardShowCase />,
  },
  { id: 'snackbar', label: 'Snackbar', component: <SnackbarShowCase /> },
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
          <TabList className="scrollbar-hide flex flex-wrap gap-2 overflow-auto pb-4">
            {showcases.map(({ id, label }) => (
              <Tab
                key={id}
                id={id}
                className="text-14 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:border-gray-500 hover:bg-gray-50 data-selected:border-gray-700 data-selected:bg-gray-100 data-selected:font-semibold"
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
