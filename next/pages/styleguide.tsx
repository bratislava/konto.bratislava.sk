import { StatusBar } from 'components/forms/info-components/StatusBar'
import PageWrapper from 'components/layouts/PageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import DatePickerShowCase from 'components/styleguide/showcases/DatePickerShowCase'
import InputFieldShowCase from 'components/styleguide/showcases/InputFieldShowCase'
import MyApplicationsCardShowCase from 'components/styleguide/showcases/MyApplicationsCardShowCase'
import TimePickerShowCase from 'components/styleguide/showcases/TimePickerShowCase'
import TooltipShowCase from 'components/styleguide/showcases/TooltipShowCase'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import AccordionShowCase from '../components/styleguide/showcases/AccordionShowCase'
import AlertShowCase from '../components/styleguide/showcases/AlertShowCase'
import BannerShowCase from '../components/styleguide/showcases/BannerShowCase'
import ButtonNewShowCase from '../components/styleguide/showcases/ButtonNewShowCase'
import ButtonShowCase from '../components/styleguide/showcases/ButtonShowCase'
import CheckboxGroupShowCase from '../components/styleguide/showcases/CheckboxGroupedShowCase'
import DropdownShowCase from '../components/styleguide/showcases/DropdownShowCase'
import FieldHeaderShowCase from '../components/styleguide/showcases/FieldHeaderShowCase'
import IconShowCase from '../components/styleguide/showcases/IconShowCase'
import ModalShowCase from '../components/styleguide/showcases/ModalShowCase'
import ProgressBarShowCase from '../components/styleguide/showcases/ProgressBarShowCase'
import RadioGroupShowCase from '../components/styleguide/showcases/RadioGroupShowCase'
import SearchFieldShowCase from '../components/styleguide/showcases/SearchFieldShowCase'
import SelectFieldNewShowCase from '../components/styleguide/showcases/SelectFieldNewShowCase'
import SelectFieldShowCase from '../components/styleguide/showcases/SelectFieldShowCase'
import SelectMultiNewShowCase from '../components/styleguide/showcases/SelectMultiNewShowCase'
import ServiceCardShowCase from '../components/styleguide/showcases/ServiceCardShowCase'
import SingleCheckboxShowCase from '../components/styleguide/showcases/SingleCheckboxShowCase'
import SnackbarShowCase from '../components/styleguide/showcases/SnackbarShowCase'
import SpinnerShowCase from '../components/styleguide/showcases/SpinnerShowCase'
import StatusBarShowCase from '../components/styleguide/showcases/StatusBarShowCase'
import SummaryRowShowCase from '../components/styleguide/showcases/SummaryRowShowCase'
import TagShowCase from '../components/styleguide/showcases/TagShowCase'
import TextAreaFieldShowCase from '../components/styleguide/showcases/TextAreaFieldShowCase'
import ToggleShowCase from '../components/styleguide/showcases/ToggleShowCase'
import UploadShowCase from '../components/styleguide/showcases/UploadShowCase'
import StyleGuideWrapper from '../components/styleguide/StyleGuideWrapper'
import { isProductionDeployment } from '../frontend/utils/general'
import { AsyncServerProps } from '../frontend/utils/types'

const Styleguide = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  /**
   * Always create new component for adding showcase in StyleGuide
   * Path to StyleGuide showcase components should be ./next/components/styleguide/showcases
   * */
  return (
    <>
      <StatusBar />
      <PageWrapper locale={page.locale}>
        <StyleGuideWrapper>
          {/* HERE ADD SHOWCASES */}
          <IconShowCase />
          <StatusBarShowCase />
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
          <SelectFieldNewShowCase />
          <SelectFieldShowCase />
          <DropdownShowCase />
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
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }

  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      page: {
        locale: ctx.locale,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default ServerSideAuthProviderHOC(Styleguide)
