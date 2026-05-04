import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDtoErrorEnum, GetFormResponseDtoStateEnum } from 'openapi-clients/forms'
import { useMemo } from 'react'

import {
  CheckIcon,
  CrossIcon,
  ErrorIcon,
  ScanningIcon,
  SendIcon,
  TwoPeopleIcon,
} from '@/src/assets/ui-icons'
import logger from '@/src/frontend/utils/logger'

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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </Typography>
          ),
        },
        // should behave like a regular draft
        [GetFormResponseDtoErrorEnum.FilesNotYetScanned]: {
          icon: null,
          iconRound: null,
          text: (
            <Typography>
              {t('account_section_applications.navigation_concept_card.status_draft')}
            </Typography>
          ),
        },
        [GetFormResponseDtoErrorEnum.UnableToScanFiles]: {
          icon: <ErrorIcon className="size-6 text-error" />,
          iconRound: (
            <div className="rounded-full bg-negative-100 p-1.5">
              <CrossIcon className="size-5 text-error" />
            </div>
          ),
          text: (
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_antivirus')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error_other')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </Typography>
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
          text: (
            <Typography>
              {t('account_section_applications.navigation_concept_card.status_draft')}
            </Typography>
          ),
        },
        QUEUED: {
          icon: <ScanningIcon className="size-6" />,
          iconRound: (
            <div className="rounded-full bg-gray-100 p-1.5">
              <ScanningIcon className="size-5" />
            </div>
          ),
          text: (
            <Typography>
              {t('account_section_applications.navigation_concept_card.status_scanning')}
            </Typography>
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
            <Typography className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.delivered_nases')}
            </Typography>
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
            <Typography className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_sending')}
            </Typography>
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
            <Typography className="text-warning-700">
              {t('account_section_applications.navigation_concept_card.status_processing')}
            </Typography>
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
            <Typography className="text-success-700">
              {t('account_section_applications.navigation_concept_card.status_finished')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_rejected')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </Typography>
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
            <Typography className="text-error">
              {t('account_section_applications.navigation_concept_card.status_error')}
            </Typography>
          ),
        },
        NONE: {
          icon: null,
          iconRound: null,
          text: (
            <Typography>
              {t('account_section_applications.navigation_concept_card.status_none')}
            </Typography>
          ),
        },
      } as const
    )[state || 'NONE']
  }, [error, state, t])
}

export default useFormStateComponents
