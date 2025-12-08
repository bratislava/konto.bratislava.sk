import { CrossIcon, EditIcon } from '@assets/ui-icons'
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
    <div className="w-fit">
      {
        // first button is to fix bug with autofocus of button 'cancel edit'
        isEditing ? (
          <div className="flex flex-row items-center gap-5">
            <Button className="hidden size-0" />
            <Button
              className="hidden h-full"
              variant="plain-black"
              size="sm"
              text={t('my_profile.profile_detail.discard_changes_button')}
              onPress={onCancelEditing}
            />
            <Button
              className="hidden md:block"
              variant="black"
              size="sm"
              text={t('my_profile.profile_detail.save_changes_button')}
              type="submit"
              form={formId}
              data-cy="save-personal-information-button"
            />
            <CrossIcon
              className="block h-6 w-6 cursor-pointer md:hidden"
              onClick={onCancelEditing}
            />
          </div>
        ) : (
          <div className="w-fit">
            <Button
              variant="black"
              startIcon={<EditIcon fill="white" className="size-6" />}
              size="sm"
              text={t('my_profile.profile_detail.edit_button')}
              className="hidden md:block"
              onPress={() => onChangeIsEditing(true)}
              data-cy="edit-personal-information-button"
            />

            <EditIcon
              className="block size-6 cursor-pointer md:hidden"
              onClick={() => onChangeIsEditing(true)}
              data-cy="edit-personal-information-button-mobile"
            />
          </div>
        )
      }
    </div>
  )
}

export default UserProfileDetailsButtons
