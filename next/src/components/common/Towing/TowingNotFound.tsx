import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import TowingIcon from '@/src/assets/icons/transport-and-maps/towing.svg'
import Markdown from '@/src/components/formatting/Markdown'

type Props = {
  initialLicensePlate: string
}

const TowingNotFound = ({ initialLicensePlate }: Props) => {
  const { t } = useTranslation()

  const [licensePlate] = useState(initialLicensePlate) // TODO: Remove this once the license plate is part of the response

  return (
    <>
      <Typography variant="h3">{t('TowingNotFound.heading', { licensePlate })}</Typography>

      <div className="flex flex-col items-center gap-6 rounded-md border p-6 text-center lg:p-12">
        <div className="size-12 shrink-0 lg:size-16">
          <TowingIcon />
        </div>

        <Typography variant="p-large">{t('TowingNotFound.title')}</Typography>

        <Markdown content={t('TowingNotFound.content')} />
      </div>
    </>
  )
}

export default TowingNotFound
