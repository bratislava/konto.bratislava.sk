import { useTranslation } from 'next-i18next/pages'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  variant: 'verification-needed' | 'verification-in-process'
}

const IdentityVerificationBanner = ({ variant }: Props) => {
  const { t } = useTranslation('account')

  if (variant === 'verification-needed') {
    return (
      <AnnouncementBlock
        announcementContent={t('IdentityVerificationBanner.verificationNeeded.content')}
        imageSrc={ImageMestskeKontoSituacia}
        buttons={[
          {
            children: t('IdentityVerificationBanner.verificationNeeded.button'),
            href: ROUTES.IDENTITY_VERIFICATION,
            variant: 'solid',
            fullWidthMobile: true,
          },
        ]}
      />
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (variant === 'verification-in-process') {
    return (
      <AnnouncementBlock
        announcementContent={t('IdentityVerificationBanner.verificationInProcess.content')}
        imageSrc={ImageMestskeKontoSituacia}
      />
    )
  }

  return null
}

export default IdentityVerificationBanner
