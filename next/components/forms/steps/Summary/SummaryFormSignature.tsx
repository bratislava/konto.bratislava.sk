import { BinIcon, EditIcon, EllipsisVerticalIcon } from '@assets/ui-icons'
import React, { PropsWithChildren, useMemo } from 'react'

import Alert from '../../info-components/Alert'
import { useFormSignature } from '../../signer/useFormSignature'
import { useFormSignerLoader } from '../../signer/useFormSignerLoader'
import ButtonNew from '../../simple-components/ButtonNew'
import MenuDropdown from '../../simple-components/MenuDropdown/MenuDropdown'
import { useFormState } from '../../useFormState'

/**
 * TODO: Texts and translations + MenuDropdown position fix
 */
const SummaryFormSignature = () => {
  const { isSigned } = useFormState()
  const { isLoading, isReady, isError, isNotSupported, retry } = useFormSignerLoader()
  const { signature, sign, isValidSignature, remove } = useFormSignature()

  const validSignature = useMemo(() => isValidSignature(), [isValidSignature])

  if (!isSigned) {
    return null
  }

  const AlertContent = ({ children }: PropsWithChildren) => (
    <div className="flex">
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
              icon: <EditIcon className="h-6 w-6" />,
              onPress: () => sign(),
            },
            {
              title: 'Odstrániť podpis',
              icon: <BinIcon className="h-6 w-6" />,
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
      {isNotSupported && <Alert type="error" message={<>Vaša platforma nie je podporovaná.</>} />}
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
                  isDisabled={!isReady}
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
          isDisabled={!isReady}
          onPress={() => sign()}
        >
          Podpísať dokument
        </ButtonNew>
      )}
    </div>
  )
}

export default SummaryFormSignature
