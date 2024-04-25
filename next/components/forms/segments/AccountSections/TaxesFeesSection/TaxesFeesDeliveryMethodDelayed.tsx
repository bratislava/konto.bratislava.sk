import React from 'react'

import Alert from '../../../info-components/Alert'

const TaxesFeesDeliveryMethodDelayed = () => {
  // TODO: Integrate with Strapi

  return (
    <Alert
      type="info"
      fullWidth
      message={
        <>
          <span className="text-h6">Zmena spôsobu doručenia sa prejaví až v roku 2025</span>
          <p className="text-p2">
            Na zaplatenie dane z nehnuteľností môžete využiť Bratislavské konto. Avšak, keďže ste sa
            do Bratislavského konta registrovali až po 17. apríli, tento rok vám doručíme štandardné
            rozhodnutie poštou do vlastných rúk. Zmena spôsobu doručenia na oznámenie cez
            Bratislavské konto sa prejaví až v roku 2025.
          </p>
        </>
      }
    />
  )
}

export default TaxesFeesDeliveryMethodDelayed
