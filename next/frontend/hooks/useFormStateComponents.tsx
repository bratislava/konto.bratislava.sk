import {
  CheckIcon,
  CrossIcon,
  ErrorIcon,
  ScanningIcon,
  SendIcon,
  TwoPeopleIcon,
} from '@assets/ui-icons'
import { GetFormResponseDtoErrorEnum, GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'

export type UseFormStateComponentsParams = {
  state?: GetFormResponseDtoStateEnum | null
  error?: GetFormResponseDtoErrorEnum | null
  isLatestSchemaVersionForSlug?: boolean
}

const useFormStateComponents = ({
  state,
  error,
  isLatestSchemaVersionForSlug,
}: UseFormStateComponentsParams) => {
  const { t } = useTranslation('account')
  // note: in case of 'unsafe return of any type' the BE enum likely changed/expanded - see const ret assignment below
  return useMemo(() => {
    if ((state === 'ERROR' || state === 'DRAFT') && !isLatestSchemaVersionForSlug) {
      // we ignore all other states for unsent forms which are of old schemas - these become readonly drafts
      return {
        icon: null,
        iconRound: null,
        text: <p>{t('account_section_applications.navigation_concept_card.status_draft')}</p>,
      }
    }
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
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
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
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.InfectedFiles]: {
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.NasesSendError]: {
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </p>
          ),
        },
        [GetFormResponseDtoErrorEnum.GinisSendError]: {
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
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
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
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
          icon: <ScanningIcon className="h-6 w-6" />,
          iconRound: (
            <div className="rounded-full bg-gray-100 p-1.5">
              <ScanningIcon className="h-5 w-5" />
            </div>
          ),
          text: <p>{t('account_section_applications.navigation_concept_card.status_scanning')}</p>,
        },
        DELIVERED_NASES: {
          icon: <SendIcon className="h-6 w-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="h-5 w-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_sending')}
            </p>
          ),
        },
        DELIVERED_GINIS: {
          icon: <SendIcon className="h-6 w-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="h-5 w-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_sending')}
            </p>
          ),
        },
        READY_FOR_PROCESSING: {
          icon: <SendIcon className="h-6 w-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <SendIcon className="h-5 w-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t(
                'account_section_applications.navigation_concept_card.status_ready_for_processing',
              )}
            </p>
          ),
        },
        PROCESSING: {
          icon: <TwoPeopleIcon className="h-6 w-6 text-warning-700" />,
          iconRound: (
            <div className="rounded-full bg-warning-100 p-1.5">
              <TwoPeopleIcon className="h-5 w-5 text-warning-700" />
            </div>
          ),
          text: (
            <p className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_processing')}
            </p>
          ),
        },
        FINISHED: {
          icon: <CheckIcon className="h-6 w-6 text-success-700" />,
          iconRound: (
            <div className="rounded-full bg-success-100 p-1.5">
              <CheckIcon className="h-5 w-5 text-success-700" />
            </div>
          ),
          text: (
            <p className="text-success-700">
              {t('account_section_applications.navigation_concept_card.status_finished')}
            </p>
          ),
        },
        REJECTED: {
          icon: <CrossIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
            </div>
          ),
          text: (
            <p className="text-error">
              {t('account_section_applications.navigation_concept_card.status_rejected')}
            </p>
          ),
        },
        ERROR: {
          icon: <ErrorIcon className="h-6 w-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="h-5 w-5 text-error" />
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
  }, [error, isLatestSchemaVersionForSlug, state, t])
}

export default useFormStateComponents
