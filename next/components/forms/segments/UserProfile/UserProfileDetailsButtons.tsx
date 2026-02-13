import { useTranslation } from 'next-i18next'

import { CrossIcon, EditIcon } from '@/assets/ui-icons'
import Button from '@/components/forms/simple-components/Button'

interface UserProfileDetailsButtonsProps {
  formId: string
  isEditing?: boolean
  onChangeIsEditing: (isEditing: boolean) => void
  onCancelEditing: () => void
}

const UserProfileDetailsButtons = ({
  formId,
  isEditing,
  onChangeIsEditing,
  onCancelEditing,
}: UserProfileDetailsButtonsProps) => {
  const { t } = useTranslation('account')

  return (
    // first button is to fix bug with autofocus of button 'cancel edit'
    <div className="flex items-center gap-6">
      {isEditing ? (
        <>
          {/* Cancel button */}
          <Button className="max-md:hidden" variant="plain" onPress={onCancelEditing}>
            {t('my_profile.profile_detail.discard_changes_button')}
          </Button>
          <Button
            variant="icon-wrapped"
            className="md:hidden"
            icon={<CrossIcon />}
            aria-label={t('my_profile.profile_detail.discard_changes_button')}
            onPress={onCancelEditing}
            size="large"
          />

          {/* Save button (desktop) */}
          <Button
            variant="solid"
            className="max-md:hidden"
            type="submit"
            form={formId}
            data-cy="save-personal-information-button"
          >
            {t('my_profile.profile_detail.save_changes_button')}
          </Button>
        </>
      ) : (
        <>
          {/* Edit button */}
          <Button
            variant="solid"
            className="max-md:hidden"
            startIcon={<EditIcon />}
            onPress={() => onChangeIsEditing(true)}
            data-cy="edit-personal-information-button"
          >
            {t('my_profile.profile_detail.edit_button')}
          </Button>
          <Button
            variant="icon-wrapped"
            className="md:hidden"
            icon={<EditIcon />}
            aria-label={t('my_profile.profile_detail.edit_button')}
            onPress={() => onChangeIsEditing(true)}
            data-cy="edit-personal-information-button-mobile"
            size="large"
          />
        </>
      )}
    </div>
  )
}

export default UserProfileDetailsButtons
