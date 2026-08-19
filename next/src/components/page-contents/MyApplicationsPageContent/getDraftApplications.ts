import { AuthSession } from 'aws-amplify/auth'
import { GetFormResponseDtoStateEnum, GetFormsResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import { patchApplicationFormIfNeeded } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededClient'
import { ApplicationsListVariant } from '@/src/pages/moje-ziadosti'

// must be string due to typing
const PAGE_SIZE = '10'

export const getDraftApplications = async (
  variant: ApplicationsListVariant,
  page: number,
  emailFormSlugs: string[],
  getSsrAuthSession?: () => Promise<AuthSession>,
): Promise<GetFormsResponseDto> => {
  // TODO - required functionality per product docs - SENDING tab will display only the ERRORs that the user can edit + queued
  const variantToStates: Array<GetFormResponseDtoStateEnum> = {
    SENT: [
      'REJECTED',
      'FINISHED',
      'PROCESSING',
      'DELIVERED_NASES',
      'DELIVERED_GINIS',
    ] satisfies Array<GetFormResponseDtoStateEnum>,
    SENDING: ['QUEUED', 'ERROR'] satisfies Array<GetFormResponseDtoStateEnum>,
    DRAFT: ['DRAFT'] satisfies Array<GetFormResponseDtoStateEnum>,
  }[variant]

  const response = await formsClient.formsControllerGetForms(
    page?.toString(),
    PAGE_SIZE,
    variantToStates,
    // TODO update when backend behaviour changes
    // if this is set varianToStates would be ignored, that does not match the required functionality in any of the tabs
    undefined,
    undefined,
    { authStrategy: 'authOnly', getSsrAuthSession },
  )

  return {
    ...response.data,
    items: response.data.items.map((item) => patchApplicationFormIfNeeded(item, emailFormSlugs)),
  }
}
