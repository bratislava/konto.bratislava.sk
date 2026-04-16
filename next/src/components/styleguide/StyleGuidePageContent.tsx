import { parseAsString, useQueryState } from 'nuqs'
import { ReactElement } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

import { StatusBar } from '@/src/components/simple-components/StatusBar'
import AccordionShowCase from '@/src/components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '@/src/components/styleguide/showcases/AlertShowCase'
import AuthFormsShowCase from '@/src/components/styleguide/showcases/AuthFormsShowCase'
import BannerShowCase from '@/src/components/styleguide/showcases/BannerShowCase'
import ButtonShowCase from '@/src/components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '@/src/components/styleguide/showcases/CheckboxGroupShowCase'
import DatePickerShowCase from '@/src/components/styleguide/showcases/DatePickerShowCase'
import FieldHeaderShowCase from '@/src/components/styleguide/showcases/FieldHeaderShowCase'
import IconShowCase from '@/src/components/styleguide/showcases/IconShowCase'
import InputFieldShowCase from '@/src/components/styleguide/showcases/InputFieldShowCase'
import ModalShowCase from '@/src/components/styleguide/showcases/ModalShowCase'
import MyApplicationsCardShowCase from '@/src/components/styleguide/showcases/MyApplicationsCardShowCase'
import NumberFieldShowCase from '@/src/components/styleguide/showcases/NumberFieldShowCase'
import PasswordFieldShowCase from '@/src/components/styleguide/showcases/PasswordFieldShowCase'
import ProgressBarShowCase from '@/src/components/styleguide/showcases/ProgressBarShowCase'
import RadioGroupShowCase from '@/src/components/styleguide/showcases/RadioGroupShowCase'
import SelectMultiNewShowCase from '@/src/components/styleguide/showcases/SelectFieldShowCase'
import ServiceCardShowCase from '@/src/components/styleguide/showcases/ServiceCardShowCase'
import SpinnerShowCase from '@/src/components/styleguide/showcases/SpinnerShowCase'
import SummaryRowShowCase from '@/src/components/styleguide/showcases/SummaryRowShowCase'
import TagShowCase from '@/src/components/styleguide/showcases/TagShowCase'
import TextAreaFieldShowCase from '@/src/components/styleguide/showcases/TextAreaFieldShowCase'
import TimePickerShowCase from '@/src/components/styleguide/showcases/TimePickerShowCase'
import ToastShowCase from '@/src/components/styleguide/showcases/ToastShowCase'
import ToggleShowCase from '@/src/components/styleguide/showcases/ToggleShowCase'
import TooltipShowCase from '@/src/components/styleguide/showcases/TooltipShowCase'
import UploadShowCase from '@/src/components/styleguide/showcases/UploadShowCase'

import StyleGuideWrapper from './StyleGuideWrapper'

const showcases: { id: string; label: string; component: ReactElement }[] = [
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
  { id: 'input-field', label: 'Input Field / Text Field', component: <InputFieldShowCase /> },
  { id: 'text-area-field', label: 'Text Area Field', component: <TextAreaFieldShowCase /> },
  { id: 'number-field', label: 'Number Field', component: <NumberFieldShowCase /> },
  { id: 'password-field', label: 'Password Field', component: <PasswordFieldShowCase /> },
  { id: 'radio-group', label: 'Radio Group', component: <RadioGroupShowCase /> },
  { id: 'checkbox-group', label: 'Checkbox Group', component: <CheckboxGroupShowCase /> },
  { id: 'date-picker', label: 'Date Picker', component: <DatePickerShowCase /> },
  { id: 'time-picker', label: 'Time Picker', component: <TimePickerShowCase /> },
  { id: 'select', label: 'Select', component: <SelectMultiNewShowCase /> },
  { id: 'toggle', label: 'Toggle', component: <ToggleShowCase /> },
  { id: 'alert', label: 'Alert', component: <AlertShowCase /> },
  { id: 'upload', label: 'Upload', component: <UploadShowCase /> },
  { id: 'accordion', label: 'Accordion', component: <AccordionShowCase /> },
  { id: 'progress-bar', label: 'Progress Bar', component: <ProgressBarShowCase /> },
  { id: 'summary-row', label: 'Summary Row', component: <SummaryRowShowCase /> },
  { id: 'banner', label: 'Banner', component: <BannerShowCase /> },
  { id: 'service-card', label: 'Service Card', component: <ServiceCardShowCase /> },
  {
    id: 'my-applications-card',
    label: 'My Applications Card',
    component: <MyApplicationsCardShowCase />,
  },
  { id: 'toast', label: 'Toast', component: <ToastShowCase /> },
  { id: 'auth-forms', label: 'Auth Forms', component: <AuthFormsShowCase /> },
]

const StyleGuidePageContent = () => {
  const [selectedKey, setSelectedKey] = useQueryState('showcase', parseAsString)

  return (
    <>
      <StatusBar />

      <StyleGuideWrapper>
        <Tabs
          selectedKey={selectedKey ?? undefined}
          onSelectionChange={(value) => setSelectedKey(value.toString())}
          className="mb-10 flex flex-col"
        >
          <TabList className="flex flex-wrap gap-2 pb-4">
            {showcases.map(({ id, label }) => (
              <Tab
                key={id}
                id={id}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 data-selected:border-gray-700 data-selected:bg-gray-100 data-selected:font-semibold"
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

export default StyleGuidePageContent
