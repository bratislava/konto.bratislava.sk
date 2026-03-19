import { useFormMenuItems } from '@/src/components/forms/useFormMenuItems'
import Button from '@/src/components/simple-components/Button'
import cn from '@/src/utils/cn'

/**
 * Figma: TODO
 */

const FormBottomMenu = () => {
  const menuItems = useFormMenuItems()

  return (
    <ul className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 lg:hidden">
      {menuItems.map((menuItem, index) => (
        // TODO use button variants correctly (design needed)
        <li key={index}>
          {menuItem.url ? (
            <Button
              variant="link"
              data-cy={menuItem.dataCy ?? ''}
              href={menuItem.url}
              hasLinkIcon={false}
              startIcon={menuItem.icon}
              className={cn('flex items-center gap-3 text-p2', menuItem.className)}
            >
              {menuItem.title}
            </Button>
          ) : (
            <Button
              variant="unstyled"
              data-cy={menuItem.dataCy ?? ''}
              onPress={menuItem.onPress}
              startIcon={menuItem.icon}
              className={cn('flex items-center gap-3 text-p2', menuItem.className)}
            >
              {menuItem.title}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default FormBottomMenu
