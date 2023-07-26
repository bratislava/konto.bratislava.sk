import { CrossIcon, EditIcon } from '@assets/ui-icons'
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
      {
        // first button is to fix bug with autofocus of button 'cancel edit'
        isEditing ? (
          <div className="flex flex-row items-center gap-5">
            <Button className="hidden h-0 w-0" />
            <Button
              className={cx('hidden h-full', 'md:block')}
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
            <CrossIcon
              className={cx('block h-6 w-6 cursor-pointer', 'md:hidden')}
              onClick={onCancelEditing}
            />
          </div>
        ) : (
          <div className="width-fit">
            <Button
              variant="black"
              startIcon={<EditIcon fill="white" className="h-6 w-6" />}
              size="sm"
              text={t('profile_detail.start_edit_button')}
              className="hidden md:block"
              onPress={() => onChangeIsEditing(true)}
            />
            <EditIcon
              className="block h-6 w-6 cursor-pointer md:hidden"
              onClick={() => onChangeIsEditing(true)}
            />
          </div>
        )
      }
    </div>
  )
}

export default UserProfileDetailsButtons
