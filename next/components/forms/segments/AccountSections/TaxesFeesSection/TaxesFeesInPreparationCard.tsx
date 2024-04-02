import React from 'react'

import Alert from '../../../info-components/Alert'

const TaxesFeesInPreparationCard = () => {
  return (
    <Alert
      type="warning"
      fullWidth
      message={
        // TODO: Texts from Strapi.
        <>
          <span className="text-h6">Vašu daň z nehnuteľností pre rok 2024 pripravujeme</span>
          <p>
            Informácie o dani z nehnuteľností budú v kontách pribúdať postupne{' '}
            <strong>od 29. apríla 2024</strong>. Keď bude vaša daň z nehnuteľností pripravená,{' '}
            <strong>dostanete notifikačný e-mail.</strong>
          </p>
        </>
      }
    />
  )
}

export default TaxesFeesInPreparationCard
