import { GetFormResponseDto, GetFormResponseDtoStateEnum } from 'openapi-clients/forms'

/**
 * For email forms, we want to display "Odoslané" instead of "Vybavené" (Finished). This is a
 * temporary solution until "My Applications are refactored".
 */
export const patchApplicationFormIfNeeded = <
  Form extends Pick<GetFormResponseDto, 'formDefinitionSlug' | 'state'>,
>(
  form: Form,
  emailFormSlugs: string[],
): Form => {
  const isEmailForm = emailFormSlugs.includes(form.formDefinitionSlug)
  if (isEmailForm && form.state === GetFormResponseDtoStateEnum.Finished) {
    return {
      ...form,
      state: GetFormResponseDtoStateEnum.DeliveredNases,
    }
  }

  return form
}
