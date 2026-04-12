import { Button } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import { router } from 'next/client'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import { AlertIcon, ErrorIcon } from '@/src/assets/ui-icons'
import { formsClient } from '@/src/clients/forms'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormContext } from '@/src/components/forms/useFormContext'
import useToast from '../simple-components/Toast/useToast'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21643-15659&t=9VxOW0GxS2SEYDIL-4
 */

const FormVersionCompareAction = () => {
  const {
    formId,
    versionCompareContinueAction,
    formDefinition: { slug },
  } = useFormContext()
  const { isSignedIn } = useSsrAuth()
  const { t } = useTranslation('forms')
  const { showToast } = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { mutate: bumpVersionMutate, isPending: bumpVersionIsPending } = useMutation({
    mutationFn: () =>
      formsClient.formsControllerBumpJsonVersion(formId, { authStrategy: 'authOrGuestWithToken' }),
    networkMode: 'always',
    onSuccess: () => {
      router.reload()
      setIsRedirecting(true)
    },
    onError: () => {
      showToast({
        message: t('form_version_compare_action.error_version_update'),
        variant: 'error',
      })
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
    <div className="bg-gray-0 flex flex-col justify-between py-16 md:bg-gray-50 md:py-28">
      <div className="flex flex-col">
        <div className="bg-gray-0 mx-auto flex size-full max-w-[734px] flex-col items-center gap-4 rounded-none px-4 pb-4 pt-6 md:gap-6 md:rounded-2xl md:px-14 md:py-12 lg:max-w-[800px]">
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
            <h2 className="text-h2 text-center">
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
            {isSignedIn ? (
              <Button variant="outline" fullWidth href={ROUTES.MY_APPLICATIONS} hasLinkIcon={false}>
                {t('form_version_compare_action.button_back')}
              </Button>
            ) : null}
            {versionCompareContinueAction === VersionCompareContinueAction.CannotContinue ? (
              <Button
                variant="solid"
                fullWidth
                href={ROUTES.MUNICIPAL_SERVICES_FORM(slug)}
                hasLinkIcon={false}
              >
                {t('form_version_compare_action.button_create_new')}
              </Button>
            ) : null}
            {versionCompareContinueAction === VersionCompareContinueAction.RequiresBump ? (
              <Button
                variant="solid"
                fullWidth
                onPress={() => {
                  bumpVersionMutate()
                }}
                isLoading={bumpVersionIsPending || isRedirecting}
              >
                {t('form_version_compare_action.button_confirm')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormVersionCompareAction
