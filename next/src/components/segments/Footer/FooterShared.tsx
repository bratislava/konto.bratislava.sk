import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/src/assets/icons-social-media'
import { FooterColumnBlockFragment, FooterFragment } from '@/src/clients/graphql-strapi/api'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import MLink from '@/src/components/simple-components/MLink'
import { isDefined } from '@/src/frontend/utils/general'
import { getLinkProps } from '@/src/utils/getLinkProps'

export const FooterSocialLinks = ({
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  linkedinUrl,
  tiktokUrl,
}: FooterFragment) => {
  const socialLinks = [
    { url: facebookUrl, icon: <FacebookIcon />, ariaLabel: 'Facebook' },
    { url: instagramUrl, icon: <InstagramIcon />, ariaLabel: 'Instagram' },
    { url: youtubeUrl, icon: <YoutubeIcon />, ariaLabel: 'YouTube' },
    { url: linkedinUrl, icon: <LinkedinIcon />, ariaLabel: 'LinkedIn' },
    { url: tiktokUrl, icon: <TiktokIcon />, ariaLabel: 'TikTok' },
  ]

  return (
    <>
      {socialLinks
        .map(({ url, icon, ariaLabel }, index) => {
          if (!url) return null

          return (
            <Button
              key={index}
              href={url}
              icon={icon}
              aria-label={ariaLabel}
              target="_blank"
              variant="icon-wrapped-negative-margin"
              rel="noreferrer"
              size="large"
              hasLinkIcon={false}
            />
          )
        })
        .filter(isDefined)}
    </>
  )
}

export const FooterContacts = ({ contactText }: FooterFragment) => {
  return (
    <div className="flex flex-col gap-x-6 gap-y-3">
      <AccountMarkdown variant="sm" content={contactText ?? ''} />
    </div>
  )
}

export const FooterAccessibilityLink = ({ accessibilityPageLink }: FooterFragment) => {
  return accessibilityPageLink ? (
    <MLink variant="underlined" {...getLinkProps(accessibilityPageLink)} />
  ) : null
}

export const FooterCopyright = () => {
  const { t } = useTranslation('account')

  return (
    <p className="text-center text-p2 text-content-passive-secondary">
      {t('Footer.text', { currentYear: new Date().getFullYear() })}
    </p>
  )
}

export const FooterColumnLinks = ({ links }: FooterColumnBlockFragment) => {
  return (
    <>
      {links?.filter(isDefined)?.map((link, index) => (
        <MLink variant="underlined" {...getLinkProps(link)} key={index} />
      ))}
    </>
  )
}
