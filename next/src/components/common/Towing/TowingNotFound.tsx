import { Typography } from '@bratislava/component-library'

import { TowingIcon } from '@/src/assets/icons/transport-and-maps/towing.svg'
import Markdown from '@/src/components/formatting/Markdown'

const TowingNotFound = () => {
  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border p-12">
      <div className="size-12 shrink-0 lg:size-16">
        <TowingIcon />
      </div>

      <Typography variant="p-large" className="text-center">
        {t('towing.notFound.title')}
      </Typography>

      <Markdown content={t('towing.notFound.content')} className="text-center" />
    </div>
  )
}

export default TowingNotFound
