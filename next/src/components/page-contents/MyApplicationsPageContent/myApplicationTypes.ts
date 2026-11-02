import { GetFormResponseDto, GetFormsResponseDtoItemsInner } from 'openapi-clients/forms'

/**
 * TODO Replace with clean types exported from BE, then remove this file
 * - generated types are not named well for FE use (e.g. `GetFormsResponseDtoItemsInner`)
 * - `GetFormResponseDto` is missing `formSentAt`, even though BE already returns it
 */

/**
 * Form in the list of my applications (draft or sent)
 */
export type MyApplicationListItem = GetFormsResponseDtoItemsInner

/**
 * Form on the my application detail page
 */
export type MyApplicationFormData = GetFormResponseDto &
  Pick<MyApplicationListItem, 'formSentAt'>
