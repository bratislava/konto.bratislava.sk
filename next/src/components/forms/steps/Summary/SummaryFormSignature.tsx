import { Button, Typography } from '@bratislava/component-library'
import { PropsWithChildren, useMemo } from 'react'

import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormSignerLoader } from '@/src/components/forms/signer/useFormSignerLoader'
import { useFormSummary } from '@/src/components/forms/steps/Summary/useFormSummary'
import { useFormContext } from '@/src/components/forms/useFormContext'
import Icon from '@/src/components/icon-components/Icon'
import Alert from '@/src/components/simple-components/Alert'
import MenuDropdown from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { isFormSigningDisabled } from '@/src/frontend/utils/formSummary'

/**
 * TODO: Texts and translations + MenuDropdown position fix
 */

const SummaryFormSignature = () => {
  const { isReadonly } = useFormContext()
  const { isLoading, isReady, isError, isNotSupported, retry } = useFormSignerLoader()
  const { signature, sign, isValidSignature, remove, getSingerDataIsPending } = useFormSignature()
  const { getValidatedSummary } = useFormSummary()

  const validSignature = useMemo(() => isValidSignature(), [isValidSignature])
  const signerButtonDisabled =
    isReadonly || !isReady || getSingerDataIsPending || isFormSigningDisabled(getValidatedSummary())

  const AlertContent = ({ children }: PropsWithChildren) => (
    <div className="flex w-full">
      <span className="grow">{children}</span>
      <div className="ml-2 shrink-0">
        <MenuDropdown
          buttonTrigger={
            <Button
              variant="icon-wrapped-negative-margin"
              size="small"
              icon={<Icon name="menu-kebab" />}
              aria-label="Menu"
            />
          }
          items={[
            {
              title: 'Podpísať znova',
              icon: <Icon name="edit" className="size-6" />,
              onPress: () => sign(),
            },
            {
              title: 'Odstrániť podpis',
              icon: <Icon name="bin" className="size-6" />,
              onPress: () => remove(),
              itemClassName: 'text-negative-700',
            },
          ]}
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Typography variant="h3">Podpis dokumentu</Typography>
        <Typography variant="p-small">
          Podpíšte dokument pred odoslaním pomocou svojho občianskeho preukazu s čipom (eID) a vašim
          zaručeným elektronickým podpisom (KEP).
        </Typography>
      </div>
      {isNotSupported && (
        <Alert
          type="error"
          message={
            <>
              Platforma, na ktorej sa nachádzate nie je podporovaná. Pozrite si{' '}
              <Button href="https://www.slovensko.sk/sk/na-stiahnutie" variant="link">
                zoznam podporovaných aplikácií.
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {isError && (
        <Alert
          type="error"
          message={
            <>
              Podpisovač sa nepodarilo načítať.{' '}
              <Button variant="link" onPress={() => retry()}>
                Skúsiť znova
              </Button>
            </>
          }
          className="min-w-full"
        />
      )}
      {signature &&
        (validSignature ? (
          <Alert
            message={<AlertContent>Dokument bol úspešne podpísaný.</AlertContent>}
            type="success"
            className="min-w-full"
          />
        ) : (
          <Alert
            message={
              <AlertContent>
                Podpis v dokumente nie je aktuálny.{' '}
                <Button
                  variant="link"
                  isLoading={isLoading}
                  isDisabled={signerButtonDisabled}
                  onPress={() => sign()}
                >
                  Podpísať znova
                </Button>
              </AlertContent>
            }
            type="warning"
            className="min-w-full"
          />
        ))}
      {!signature && (
        <Button
          variant="outline"
          isLoading={isLoading}
          isDisabled={signerButtonDisabled}
          onPress={() => sign()}
        >
          Podpísať dokument
        </Button>
      )}
    </div>
  )
}

export default SummaryFormSignature
