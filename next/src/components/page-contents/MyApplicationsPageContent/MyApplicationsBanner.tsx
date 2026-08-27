import { useTranslation } from 'next-i18next/pages'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'

type Props = {
  // This variant prop makes it more readable when we use this component
  variant: 'no-applications'
}

const MyApplicationsBanner = ({ variant }: Props) => {
  const { t } = useTranslation()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (variant === 'no-applications') {
    return (
      <AnnouncementBlock
        announcementContent={t('MyApplicationsBanner.content')}
        imageSrc={ImageMestskeKontoSituacia}
      />
    )
  }

  return null
}

export default MyApplicationsBanner
