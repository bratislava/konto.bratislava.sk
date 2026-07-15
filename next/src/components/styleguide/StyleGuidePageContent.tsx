import { parseAsString, useQueryState } from 'nuqs'
import { ReactElement } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import { AlertBanner } from '@/src/components/simple-components/AlertBanner'
import AccordionShowCase from '@/src/components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '@/src/components/styleguide/showcases/AlertShowCase'
import AuthFormsShowCase from '@/src/components/styleguide/showcases/AuthFormsShowCase'
import BannerShowCase from '@/src/components/styleguide/showcases/BannerShowCase'
import ButtonShowCase from '@/src/components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '@/src/components/styleguide/showcases/CheckboxGroupShowCase'
import DatePickerShowCase from '@/src/components/styleguide/showcases/DatePickerShowCase'
import FieldHeaderShowCase from '@/src/components/styleguide/showcases/FieldHeaderShowCase'
import FormSentPageContentShowCase from '@/src/components/styleguide/showcases/FormSentPageContentShowCase'
import FormVersionCompareActionShowCase from '@/src/components/styleguide/showcases/FormVersionCompareActionShowCase'
import IconShowCase from '@/src/components/styleguide/showcases/IconShowCase'
import MarkdownShowCase from '@/src/components/styleguide/showcases/MarkdownShowCase'
import ModalShowCase from '@/src/components/styleguide/showcases/ModalShowCase/ModalsShowCase'
import MyApplicationsCardShowCase from '@/src/components/styleguide/showcases/MyApplicationsCardShowCase'
import MyApplicationsShowCase from '@/src/components/styleguide/showcases/MyApplicationsShowCase/MyApplicationsShowCase'
import NavBarShowCase from '@/src/components/styleguide/showcases/NavBarShowCase'
import NumberFieldShowCase from '@/src/components/styleguide/showcases/NumberFieldShowCase'
import PasswordFieldShowCase from '@/src/components/styleguide/showcases/PasswordFieldShowCase'
import PaymentResultPageContentShowCase from '@/src/components/styleguide/showcases/PaymentResultPageContentShowCase'
import ProgressBarShowCase from '@/src/components/styleguide/showcases/ProgressBarShowCase'
import RadioGroupShowCase from '@/src/components/styleguide/showcases/RadioGroupShowCase'
import SearchFieldShowCase from '@/src/components/styleguide/showcases/SearchFieldShowCase'
import SelectMultiNewShowCase from '@/src/components/styleguide/showcases/SelectFieldShowCase'
import ServiceCardShowCase from '@/src/components/styleguide/showcases/ServiceCardShowCase'
import SpinnerShowCase from '@/src/components/styleguide/showcases/SpinnerShowCase'
import SummaryRowShowCase from '@/src/components/styleguide/showcases/SummaryRowShowCase'
import TagShowCase from '@/src/components/styleguide/showcases/TagShowCase'
import TaxesShowCase from '@/src/components/styleguide/showcases/TaxesShowCase/TaxesShowCase'
import TextAreaFieldShowCase from '@/src/components/styleguide/showcases/TextAreaFieldShowCase'
import TextFieldShowCase from '@/src/components/styleguide/showcases/TextFieldShowCase'
import ThankYouTileShowCase from '@/src/components/styleguide/showcases/ThankYouTileShowCase'
import TimeFieldShowCase from '@/src/components/styleguide/showcases/TimeFieldShowCase'
import ToastShowCase from '@/src/components/styleguide/showcases/ToastShowCase'
import ToggleShowCase from '@/src/components/styleguide/showcases/ToggleShowCase'
import TooltipShowCase from '@/src/components/styleguide/showcases/TooltipShowCase'
import UploadShowCase from '@/src/components/styleguide/showcases/UploadShowCase'

import StyleGuideWrapper from './StyleGuideWrapper'

const showcases: { id: string; label: string; component: ReactElement }[] = [
  { id: 'button', label: 'Button', component: <ButtonShowCase /> },
  { id: 'markdown', label: 'Markdown', component: <MarkdownShowCase /> },
  { id: 'icon', label: 'Icon', component: <IconShowCase /> },
  { id: 'tag', label: 'Tag', component: <TagShowCase /> },
  { id: 'tooltip', label: 'Tooltip', component: <TooltipShowCase /> },
  { id: 'field-header', label: 'Field Header', component: <FieldHeaderShowCase /> },
  { id: 'spinner', label: 'Spinner', component: <SpinnerShowCase /> },
  { id: 'text-field', label: 'Text Field', component: <TextFieldShowCase /> },
  { id: 'text-area-field', label: 'Text Area Field', component: <TextAreaFieldShowCase /> },
  { id: 'number-field', label: 'Number Field', component: <NumberFieldShowCase /> },
  { id: 'password-field', label: 'Password Field', component: <PasswordFieldShowCase /> },
  { id: 'search-field', label: 'Search Field', component: <SearchFieldShowCase /> },
  { id: 'radio-group', label: 'Radio Group', component: <RadioGroupShowCase /> },
  { id: 'checkbox-group', label: 'Checkbox Group', component: <CheckboxGroupShowCase /> },
  { id: 'date-picker', label: 'Date Picker', component: <DatePickerShowCase /> },
  { id: 'time-field', label: 'Time Field', component: <TimeFieldShowCase /> },
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
  { id: 'thank-you-tile', label: 'ThankYou Tile', component: <ThankYouTileShowCase /> },
  { id: 'auth-forms', label: 'Auth Forms', component: <AuthFormsShowCase /> },
  { id: 'form-sent', label: 'Form Sent', component: <FormSentPageContentShowCase /> },
  {
    id: 'payment-result',
    label: 'Payment Result',
    component: <PaymentResultPageContentShowCase />,
  },
  {
    id: 'form-version-compare-action',
    label: 'Form Version Compare Action',
    component: <FormVersionCompareActionShowCase />,
  },
  { id: 'taxes', label: 'Taxes Pages (Dane a poplatky)', component: <TaxesShowCase /> },
  {
    id: 'my-applications',
    label: 'My Applications Pages',
    component: <MyApplicationsShowCase />,
  },
  { id: 'navbar', label: 'NavBar', component: <NavBarShowCase /> },
  { id: 'modal', label: 'Modal', component: <ModalShowCase /> },
]

const StyleGuidePageContent = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'showcase',
    parseAsString.withOptions({ clearOnDefault: false }),
  )

  return (
    <>
      <AlertBanner />

      <StyleGuideWrapper>
        <Tabs
          selectedKey={selectedKey ?? undefined}
          onSelectionChange={(value) => setSelectedKey(value.toString())}
          className="mb-10 flex flex-col"
        >
          <TabList className="flex flex-wrap gap-1.5 pb-4">
            {showcases.map(({ id, label }) => (
              <Tab
                key={id}
                id={id}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
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
