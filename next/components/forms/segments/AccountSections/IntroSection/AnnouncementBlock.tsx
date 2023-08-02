import { ArrowRightIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import Image from 'next/legacy/image'
import { useTranslation } from 'next-i18next'

type ActualBlockBase = {
  announcementContent?: string
  imagePath?: string
  buttonTitle?: string
  onPress?: () => void
}

const AnnouncementBlock = ({
  announcementContent,
  imagePath = '',
  buttonTitle,
  onPress,
}: ActualBlockBase) => {
  const { t } = useTranslation('account')
  return announcementContent ? (
    <div className="mb-6 px-4 lg:mb-16 lg:px-0">
      <h2 className="text-h2 mb-4 lg:mb-6">{t('account_section_intro.announcement_title')}</h2>
      <div className="flex w-full flex-col-reverse gap-8 rounded-lg border-2 border-gray-200 lg:flex-row lg:rounded-3xl">
        <div className="flex w-full flex-col justify-center gap-4 p-4 lg:w-1/2 lg:gap-6 lg:p-12 lg:pr-14">
          <div className="flex flex-col gap-2">
            <AccountMarkdown content={announcementContent} />
          </div>
          {buttonTitle && (
            <>
              <Button
                className="hidden lg:flex"
                endIcon={<ArrowRightIcon className="h-6 w-6" />}
                variant="category"
                text={buttonTitle}
                onPress={onPress}
              />
              <Button
                className="flex lg:hidden"
                size="sm"
                endIcon={<ArrowRightIcon className="h-5 w-5" />}
                variant="category"
                text={buttonTitle}
                onPress={onPress}
              />
            </>
          )}
        </div>
        <div className="rounded-rt-none relative flex h-[180px] w-full items-center justify-center rounded-t-lg lg:h-auto lg:w-1/2 lg:rounded-r-3xl lg:rounded-tl-none">
          <Image
            src={imagePath}
            className="rounded-rt-none rounded-t-lg lg:rounded-r-3xl lg:rounded-tl-none"
            layout="fill"
            priority
            objectFit="cover"
            objectPosition="center"
          />
        </div>
      </div>
      <div className="border-b-2 border-gray-200 pt-6 lg:pt-16" />
    </div>
  ) : null
}

export default AnnouncementBlock
