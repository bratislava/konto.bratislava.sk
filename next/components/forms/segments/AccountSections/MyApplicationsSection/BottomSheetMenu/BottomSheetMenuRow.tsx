import cx from 'classnames'
import Button from 'components/forms/simple-components/ButtonNew'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'

interface BottomSheetMenuRowProps extends MenuItemBase {
  onLinkClick: () => void
}

const BottomSheetMenuRow = ({
  title,
  icon,
  url,
  onPress,
  onLinkClick,
  itemClassName,
}: BottomSheetMenuRowProps) => {
  return url ? (
    <Link className="flex items-center gap-3" href={url} onClick={() => onLinkClick()}>
      <div
        className={cx(
          'text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden flex cursor-pointer items-center gap-3 py-2 font-sans',
          itemClassName,
        )}
      >
        <span className="p-[10px]">{icon}</span>
        <span>{title}</span>
      </div>
    </Link>
  ) : (
    <Button
      onPress={onPress}
      className={cx(
        'text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden flex cursor-pointer items-center gap-3 py-2',
        itemClassName,
      )}
    >
      <span className="p-[10px]">{icon}</span>
      <span>{title}</span>
    </Button>
  )
}

export default BottomSheetMenuRow
