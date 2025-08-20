import { StatusBar } from 'components/forms/info-components/StatusBar'
import DatePickerShowCase from 'components/styleguide/showcases/DatePickerShowCase'
import InputFieldShowCase from 'components/styleguide/showcases/InputFieldShowCase'
import MyApplicationsCardShowCase from 'components/styleguide/showcases/MyApplicationsCardShowCase'
import TimePickerShowCase from 'components/styleguide/showcases/TimePickerShowCase'
import TooltipShowCase from 'components/styleguide/showcases/TooltipShowCase'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import AccordionShowCase from '../components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '../components/styleguide/showcases/AlertShowCase'
import BannerShowCase from '../components/styleguide/showcases/BannerShowCase'
import ButtonNewShowCase from '../components/styleguide/showcases/ButtonNewShowCase'
import ButtonShowCase from '../components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '../components/styleguide/showcases/CheckboxGroupedShowCase'
import FieldHeaderShowCase from '../components/styleguide/showcases/FieldHeaderShowCase'
import IconShowCase from '../components/styleguide/showcases/IconShowCase'
import ModalShowCase from '../components/styleguide/showcases/ModalShowCase'
import ProgressBarShowCase from '../components/styleguide/showcases/ProgressBarShowCase'
import RadioGroupShowCase from '../components/styleguide/showcases/RadioGroupShowCase'
import SearchFieldShowCase from '../components/styleguide/showcases/SearchFieldShowCase'
import SelectMultiNewShowCase from '../components/styleguide/showcases/SelectFieldShowCase'
import ServiceCardShowCase from '../components/styleguide/showcases/ServiceCardShowCase'
import SingleCheckboxShowCase from '../components/styleguide/showcases/SingleCheckboxShowCase'
import SnackbarShowCase from '../components/styleguide/showcases/SnackbarShowCase'
import SpinnerShowCase from '../components/styleguide/showcases/SpinnerShowCase'
import SummaryRowShowCase from '../components/styleguide/showcases/SummaryRowShowCase'
import TagShowCase from '../components/styleguide/showcases/TagShowCase'
import TextAreaFieldShowCase from '../components/styleguide/showcases/TextAreaFieldShowCase'
import ToggleShowCase from '../components/styleguide/showcases/ToggleShowCase'
import UploadShowCase from '../components/styleguide/showcases/UploadShowCase'
import StyleGuideWrapper from '../components/styleguide/StyleGuideWrapper'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { isProductionDeployment } from '../frontend/utils/general'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

const Styleguide = () => {
  /**
   * Always create new component for adding showcase in StyleGuide
   * Path to StyleGuide showcase components should be ./next/components/styleguide/showcases
   * */
  return (
    <>
      <StatusBar />

      <StyleGuideWrapper>
        {/* HERE ADD SHOWCASES */}
        <IconShowCase />
        <TagShowCase />
        <TooltipShowCase />
        <FieldHeaderShowCase />
        <ButtonNewShowCase />
        <ButtonShowCase />
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
