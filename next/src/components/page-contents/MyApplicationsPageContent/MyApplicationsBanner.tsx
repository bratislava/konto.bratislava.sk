import { useTranslation } from 'next-i18next/pages'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'

type Props = {
  variant: 'no-applications' | 'no-drafts'
}

const MyApplicationsBanner = ({ variant }: Props) => {
  const { t } = useTranslation()

  if (variant === 'no-applications') {
    return (
      <AnnouncementBlock
        announcementContent={t('MyApplicationsBanner.noApplications')}
        imageSrc={ImageMestskeKontoSituacia}
      />
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (variant === 'no-drafts') {
    return (
      <AnnouncementBlock
        announcementContent={t('MyApplicationsBanner.noDrafts')}
        imageSrc={ImageMestskeKontoSituacia}
      />
    )
  }

  return null
}

export default MyApplicationsBanner
