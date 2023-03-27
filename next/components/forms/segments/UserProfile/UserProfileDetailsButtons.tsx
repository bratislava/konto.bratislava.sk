import CloseIcon from '@assets/images/close.svg'
import EditIcon from '@assets/images/forms/edit_icon.svg'
// import WhiteEditIcon from '@assets/images/forms/edit_white.svg'
import WhiteEditIcon from '@assets/images/new-icons/ui/pen.svg'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import { useTranslation } from 'next-i18next'

interface UserProfileDetailsButtonsProps {
  formId: string
  isEditing?: boolean
  onChangeIsEditing: (isEditing: boolean) => void
  onCancelEditing: () => void
}

const UserProfileDetailsButtons = (props: UserProfileDetailsButtonsProps) => {
  const { formId, isEditing, onChangeIsEditing, onCancelEditing } = props
  const { t } = useTranslation('account')

  return (
    <div className="width-fit">
      {isEditing ? (
        <div className="flex flex-row gap-5 items-center">
          <Button
            className={cx('hidden focus:bg-white h-full', 'md:block')}
            variant="plain-black"
            size="sm"
            text={t('profile_detail.stop_edit_button')}
            onPress={onCancelEditing}
          />
          <Button
            className={cx('hidden', 'md:block')}
            variant="black"
            size="sm"
            text={t('profile_detail.save_edit_button')}
            type="submit"
            form={formId}
          />
          <CloseIcon
            className={cx('block cursor-pointer', 'md:hidden')}
            onClick={onCancelEditing}
          />
        </div>
      ) : (
        <div className="width-fit">
          <Button
            variant="black"
            startIcon={<WhiteEditIcon fill="white" className="w-6 h-6" />}
            size="sm"
            text={t('profile_detail.start_edit_button')}
            className="hidden md:block"
            onPress={() => onChangeIsEditing(true)}
          />
          <EditIcon
            className="block md:hidden cursor-pointer"
            onClick={() => onChangeIsEditing(true)}
          />
        </div>
      )}
    </div>
  )
}

export default UserProfileDetailsButtons
