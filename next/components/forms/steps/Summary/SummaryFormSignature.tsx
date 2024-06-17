import { BinIcon, EditIcon, EllipsisVerticalIcon } from '@assets/ui-icons'
import React, { PropsWithChildren, useMemo } from 'react'

import { isFormSigningDisabled } from '../../../../frontend/utils/formSummary'
import Alert from '../../info-components/Alert'
import { useFormSignature } from '../../signer/useFormSignature'
import { useFormSignerLoader } from '../../signer/useFormSignerLoader'
import ButtonNew from '../../simple-components/ButtonNew'
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
            <ButtonNew
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
              <ButtonNew
                href="https://www.slovensko.sk/sk/na-stiahnutie"
                target="_blank"
                variant="black-link"
              >
                zoznam podporovaných aplikácií.
              </ButtonNew>
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
              <ButtonNew variant="black-link" onPress={() => retry()}>
                Skúsiť znova
              </ButtonNew>
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
                <ButtonNew
                  variant="black-link"
                  isLoading={isLoading}
                  isDisabled={signerButtonDisabled}
                  onPress={() => sign()}
                >
                  Podpísať znova
                </ButtonNew>
              </AlertContent>
            }
            type="warning"
            className="min-w-full"
          />
        ))}
      {!signature && (
        <ButtonNew
          variant="black-outline"
          isLoading={isLoading}
          isDisabled={signerButtonDisabled}
          onPress={() => sign()}
        >
          Podpísať dokument
        </ButtonNew>
      )}
    </div>
  )
}

export default SummaryFormSignature
