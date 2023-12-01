import { ArrowRightIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import Image from 'next/legacy/image'

type ActualBlockBase = {
  announcementContent?: string
  imagePath?: string
  buttonTitle?: string
  onPress?: () => void
  reversed?: boolean
}

const AnnouncementBlock = ({
  announcementContent,
  imagePath = '',
  buttonTitle,
  onPress,
  reversed,
}: ActualBlockBase) => {
  return announcementContent ? (
    <div
      className={cx(
        'flex w-full flex-col-reverse rounded-lg border-2 border-gray-200 lg:rounded-lg',
        {
          'lg:flex-row-reverse': reversed,
          'lg:flex-row': !reversed,
        },
      )}
    >
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
      <div className="relative flex h-[292px] w-full items-center justify-center rounded-t-lg lg:h-auto lg:w-1/2">
        <Image
          src={imagePath}
          className={cx('rounded-t-lg', {
            'lg:rounded-l-3xl lg:rounded-tr-none': reversed,
            'lg:rounded-r-3xl lg:rounded-tl-none': !reversed,
          })}
          layout="fill"
          priority
          objectFit="cover"
          objectPosition="center"
        />
      </div>
    </div>
  ) : null
}

export default AnnouncementBlock
