import React from 'react'

const TaxesFeesPreparingCard = () => {
  return (
    // TODO: Use appropriate component, texts from Strapi.
    <div className="flex flex-col gap-1 rounded-xl bg-warning-100 px-5 py-4">
      <span className="text-h6">Vašu daň z nehnuteľností pre rok 2024 pripravujeme.</span>
      <p>
        Aj v tomto momente pracujeme na výpočte dane z nehnuteľností až pre 210 000 daňovníkov a
        daňovníčok. Informácie o dani budú v kontách postupne pribúdať od{' '}
        <strong>29. apríla 2024</strong>. Keď bude vaša daň z nehnuteľností pripravená,{' '}
        <strong>pošleme vám notifikačný e-mail</strong>.
      </p>
    </div>
  )
}

export default TaxesFeesPreparingCard
