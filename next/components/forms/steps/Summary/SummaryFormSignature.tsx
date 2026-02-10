import React, { PropsWithChildren, useMemo } from 'react'

import { BinIcon, EditIcon, EllipsisVerticalIcon } from '@/assets/ui-icons'
import { isFormSigningDisabled } from '@/frontend/utils/formSummary'

import Alert from '../../info-components/Alert'
import { useFormSignature } from '../../signer/useFormSignature'
import { useFormSignerLoader } from '../../signer/useFormSignerLoader'
import Button from '../../simple-components/Button'
import MenuDropdown from '../../simple-components/MenuDropdown/MenuDropdown'
import { useFormContext } from '../../useFormContext'
import { useFormSummary } from './useFormSummary'

/**
 * TODO: Texts and translations + MenuDropdown position fix
 */
const SummaryFormSignature = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
              icon={<EllipsisVerticalIcon />}
              aria-label="Menu"
            />
          }
          items={[
            {
              title: 'Podpísať znova',
              icon: <EditIcon className="size-6" />,
              onPress: () => sign(),
            },
            {
              title: 'Odstrániť podpis',
              icon: <BinIcon className="size-6" />,
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
        <h3 className="text-h3">Podpis dokumentu</h3>
        <p className="text-p2">
          Podpíšte dokument pred odoslaním pomocou svojho občianskeho preukazu s čipom (eID) a vašim
          zaručeným elektronickým podpisom (KEP).
        </p>
      </div>
      {isNotSupported && (
        <Alert
          type="error"
          message={
            <>
              Platforma, na ktorej sa nachádzate nie je podporovaná. Pozrite si{' '}
              <Button
                href="https://www.slovensko.sk/sk/na-stiahnutie"
                target="_blank"
                variant="link"
              >
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
