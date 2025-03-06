import { AlertIcon, ErrorIcon } from '@assets/ui-icons'
import { formsApi } from '@clients/forms'
import { useMutation } from '@tanstack/react-query'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import cn from 'frontend/cn'
import { router } from 'next/client'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import AccountMarkdown from './segments/AccountMarkdown/AccountMarkdown'
import ButtonNew from './simple-components/ButtonNew'
import { useFormContext } from './useFormContext'

const FormVersionCompareAction = () => {
  const {
    formId,
    versionCompareContinueAction,
    formDefinition: { slug },
  } = useFormContext()
  const { t } = useTranslation('forms')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { mutate: bumpVersionMutate, isPending: bumpVersionIsPending } = useMutation({
    mutationFn: () =>
      formsApi.formsControllerBumpJsonVersion(formId, { accessToken: 'onlyAuthenticated' }),
    networkMode: 'always',
    onSuccess: () => {
      router.reload()
      setIsRedirecting(true)
    },
    onError: () => {
      openSnackbarError(t('form_version_compare_action.error_version_update'))
    },
  })

  if (versionCompareContinueAction === VersionCompareContinueAction.None) {
    return null
  }

  const Icon = {
    [VersionCompareContinueAction.CannotContinue]: ErrorIcon,
    [VersionCompareContinueAction.RequiresBump]: AlertIcon,
  }[versionCompareContinueAction]

  return (
    <div className="flex flex-col justify-between bg-gray-0 py-16 md:bg-gray-50 md:py-28">
      <div className="flex flex-col">
        <div className="mx-auto flex size-full max-w-[734px] flex-col items-center gap-4 rounded-none bg-gray-0 px-4 pt-6 pb-4 md:gap-6 md:rounded-2xl md:px-14 md:py-12 lg:max-w-[800px]">
          <span
            className={cn(
              'flex h-14 w-14 min-w-14 items-center justify-center rounded-full md:h-[88px] md:w-[88px] md:min-w-[88px]',
              {
                'bg-warning-100':
                  versionCompareContinueAction === VersionCompareContinueAction.RequiresBump,
                'bg-negative-100':
                  versionCompareContinueAction === VersionCompareContinueAction.CannotContinue,
              },
            )}
          >
            <Icon
              className={cn('flex size-8 items-center justify-center md:size-10', {
                'text-warning-700':
                  versionCompareContinueAction === VersionCompareContinueAction.RequiresBump,
                'text-negative-700':
                  versionCompareContinueAction === VersionCompareContinueAction.CannotContinue,
              })}
            />
          </span>

          <div className="flex flex-col items-center gap-8 md:gap-6">
            <h2 className="text-center text-h2">
              {
                {
                  [VersionCompareContinueAction.CannotContinue]: t(
                    'form_version_compare_action.title_cannot_continue',
                  ),
                  [VersionCompareContinueAction.RequiresBump]: t(
                    'form_version_compare_action.title_requires_bump',
                  ),
                }[versionCompareContinueAction]
              }
            </h2>
            <AccountMarkdown
              variant="sm"
              content={
                {
                  [VersionCompareContinueAction.CannotContinue]: t(
                    'form_version_compare_action.content_cannot_continue',
                  ),
                  [VersionCompareContinueAction.RequiresBump]: t(
                    'form_version_compare_action.content_requires_bump',
                  ),
                }[versionCompareContinueAction]
              }
            />
          </div>

          <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
            <ButtonNew variant="black-outline" fullWidth href={ROUTES.MY_APPLICATIONS}>
              {t('form_version_compare_action.button_back')}
            </ButtonNew>
            {versionCompareContinueAction === VersionCompareContinueAction.CannotContinue ? (
              <ButtonNew
                variant="black-solid"
                fullWidth
                href={ROUTES.MUNICIPAL_SERVICES_FORM(slug)}
              >
                {t('form_version_compare_action.button_create_new')}
              </ButtonNew>
            ) : null}
            {versionCompareContinueAction === VersionCompareContinueAction.RequiresBump ? (
              <ButtonNew
                variant="black-solid"
                fullWidth
                onPress={() => {
                  bumpVersionMutate()
                }}
                isLoading={bumpVersionIsPending || isRedirecting}
              >
                {t('form_version_compare_action.button_confirm')}
              </ButtonNew>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormVersionCompareAction
