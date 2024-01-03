import React from 'react'

import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type TaxFormPdfExportModalBase = ModalV2Props

const TaxFormPdfExportModal = (props: TaxFormPdfExportModalBase) => {
  return (
    <ModalV2 modalClassname="md:max-w-[796px] md:pt-8" mobileFullScreen {...props}>
      TODO
    </ModalV2>
  )
}

export default TaxFormPdfExportModal
