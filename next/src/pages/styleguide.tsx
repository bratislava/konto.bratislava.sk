import { StatusBar } from '@/src/components/forms/info-components/StatusBar'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import AccordionShowCase from '@/src/components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '@/src/components/styleguide/showcases/AlertShowCase'
import BannerShowCase from '@/src/components/styleguide/showcases/BannerShowCase'
import ButtonShowCase from '@/src/components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '@/src/components/styleguide/showcases/CheckboxGroupedShowCase'
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
import SingleCheckboxShowCase from '@/src/components/styleguide/showcases/SingleCheckboxShowCase'
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

const Styleguide = () => {
  /**
   * Always create new component for adding showcase in StyleGuide
   * Path to StyleGuide showcase components should be ./next/src/components/styleguide/showcases
   * */
  return (
    <>
      <StatusBar />

      <StyleGuideWrapper>
        {/* HERE ADD SHOWCASES */}
        <ButtonShowCase />
        <IconShowCase />
        <TagShowCase />
        <TooltipShowCase />
        <FieldHeaderShowCase />
        <SpinnerShowCase />
        <InputFieldShowCase />
        <DatePickerShowCase />
        <TimePickerShowCase />
        <TextAreaFieldShowCase />
        <SearchFieldShowCase />
        <SelectMultiNewShowCase />
        <ToggleShowCase />
        <AlertShowCase />
        <UploadShowCase />
        <ModalShowCase />
        <AccordionShowCase />
        <ProgressBarShowCase />
        <SingleCheckboxShowCase />
        <CheckboxGroupShowCase />
        <RadioGroupShowCase />
        {/* TODO: Fix stepper showcase */}
        {/* <StepperShowCase /> */}
        <SummaryRowShowCase />
        <BannerShowCase />
        <ServiceCardShowCase />
        <MyApplicationsCardShowCase />
        <SnackbarShowCase />
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

export default SsrAuthProviderHOC(Styleguide)
