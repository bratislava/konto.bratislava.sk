import { Button, Typography } from '@bratislava/component-library'
import Link from 'next/link'

import { MenuItemBase } from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import cn from '@/src/utils/cn'

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
      <Typography
        variant="p-small"
        as="div"
        className={cn(
          'flex cursor-pointer items-center gap-3 py-2 font-sans hover:font-semibold focus:font-semibold focus:outline-hidden',
          itemClassName,
        )}
      >
        <span className="p-[10px]">{icon}</span>
        <span>{title}</span>
      </Typography>
    </Link>
  ) : (
    <Button
      onPress={onPress}
      className={cn(
        'flex cursor-pointer items-center gap-3 py-2 hover:font-semibold focus:font-semibold focus:outline-hidden',
        itemClassName,
      )}
    >
      <span className="p-[10px]">{icon}</span>
      <span>{title}</span>
    </Button>
  )
}

export default BottomSheetMenuRow
