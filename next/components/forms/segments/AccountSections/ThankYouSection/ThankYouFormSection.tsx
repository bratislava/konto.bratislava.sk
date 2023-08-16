import BratislavaIcon from '@assets/images/bratislava-footer.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from 'components/forms/simple-components/Button'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'

const ThankYouFormSection = () => {
  const { t } = useTranslation('account')

  return (
    <div className="flex h-screen flex-col justify-between bg-gray-0 pt-16 md:bg-gray-50 md:pt-28">
      <div className="flex flex-col">
        <ThankYouCard
          success
          title={t('thank_you.form_submit.title')}
          firstButtonTitle={t('thank_you.button_to_formular_text_2')}
          secondButtonTitle={t('thank_you.button_to_profil_text')}
          content={t('thank_you.form_submit.content')}
        />
        <div className="mx-auto mt-0 w-full max-w-[734px] px-4 md:mt-10 md:px-0 lg:max-w-[800px]">
          <span className="text-p2 flex">
            <AccountMarkdown
              variant="sm"
              content={`<span className='text-p2'>${t('thank_you.subtitle_mail_info')}</span>.`}
            />
          </span>
          <div className="mt-4 flex flex-col gap-3 md:mt-6">
            <Button
              label={t('thank_you.button_faq_text')}
              href={ROUTES.HELP}
              variant="link-black"
              size="sm"
            />
            <Button
              label={t('thank_you.button_privacy_text')}
              href="https://bratislava.sk/ochrana-osobnych-udajov"
              variant="link-black"
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-screen-lg flex-col items-center gap-6 pb-6 lg:flex">
        <BratislavaIcon />
        <p className="text-p2">{t('thank_you.footer_text')}</p>
      </div>
    </div>
  )
}

export default ThankYouFormSection
