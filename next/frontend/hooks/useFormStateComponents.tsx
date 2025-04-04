import {
  CheckIcon,
  CrossIcon,
  ErrorIcon,
  ScanningIcon,
  SendIcon,
  TwoPeopleIcon,
} from '@assets/ui-icons'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { GetFormResponseDtoErrorEnum, GetFormResponseDtoStateEnum } from 'openapi-clients/forms'
import { useMemo } from 'react'

export type UseFormStateComponentsParams = {
  state?: GetFormResponseDtoStateEnum | null
  error?: GetFormResponseDtoErrorEnum | null
}

const useFormStateComponents = ({ state, error }: UseFormStateComponentsParams) => {
  const { t } = useTranslation('account')
  // note: in case of 'unsafe return of any type' the BE enum likely changed/expanded - see const ret assignment below
  return useMemo(() => {
    if (state === 'ERROR') {
      // note: if ret suddenly becomes 'any', it's because GetFormResponseDtoErrorEnum changed on BE - update accordingly
      const ret = {
        // the first should never happen, kept to make ts easier
        [GetFormResponseDtoErrorEnum.None]: {
          icon: null,
          iconRound: null,
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.RabbitmqMaxTries]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </p>
          ),
        },
        // should behave like a regular draft
        [GetFormResponseDtoErrorEnum.FilesNotYetScanned]: {
          icon: null,
          iconRound: null,
          text: <p>{t('account_section_applications.navigation_concept_card.status_draft')}</p>,
        },
        [GetFormResponseDtoErrorEnum.UnableToScanFiles]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.InfectedFiles]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.NasesSendError]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.GinisSendError]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </p>
          ),
        },
      }[error || GetFormResponseDtoErrorEnum.None]

      if (!ret || !error || error === GetFormResponseDtoErrorEnum.None) {
        logger.error(`Unknown error ${error} for state ${state}`)
        return {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </p>
          ),
        }
      }
      return ret
    }
    return (
      {
        DRAFT: {
          icon: null,
          iconRound: null,
          text: <p>{t('account_section_applications.navigation_concept_card.status_draft')}</p>,
        },
        QUEUED: {
          icon: <ScanningIcon className="size-6" />,
          iconRound: (
            <div className="rounded-full bg-gray-100 p-1.5">
              <ScanningIcon className="size-5" />
            </div>
          ),
          text: <p>{t('account_section_applications.navigation_concept_card.status_scanning')}</p>,
        },
        SENDING_TO_NASES: {
          icon: <SendIcon className="size-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="size-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.sending_to_nases')}
            </p>
          ),
        },
        DELIVERED_NASES: {
          icon: <SendIcon className="size-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="size-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.delivered_nases')}
            </p>
          ),
        },
        DELIVERED_GINIS: {
          icon: <SendIcon className="size-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="size-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_sending')}
            </p>
          ),
        },
        PROCESSING: {
          icon: <TwoPeopleIcon className="size-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <TwoPeopleIcon className="size-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_processing')}
            </p>
          ),
        },
        FINISHED: {
          icon: <CheckIcon className="size-6 text-success-700" />,
          iconRound: (
            <div className="rounded-full bg-success-100 p-1.5">
              <CheckIcon className="size-5 text-success-700" />
            </div>
          ),
          text: (
            <p className="text-success-700">
              {t('account_section_applications.navigation_concept_card.status_finished')}
            </p>
          ),
        },
        REJECTED: {
          icon: <CrossIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_rejected')}
            </p>
          ),
        },
        ERROR: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </p>
          ),
        },
        // TODO verify this / update messaging as needed - added as is to fix ts error
        ERROR_USER_CAN_REPAIR: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </p>
          ),
        },
        NONE: {
          icon: null,
          iconRound: null,
          text: <p>{t('account_section_applications.navigation_concept_card.status_none')}</p>,
        },
      } as const
    )[state || 'NONE']
  }, [error, state, t])
}

export default useFormStateComponents
