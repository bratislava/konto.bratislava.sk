import { useResizeObserver } from '@react-aria/utils'
import { useRef, useState } from 'react'

/**
 * It is not possible to measure the height of navbar directly,
 * because it is `display: contents`.
 * The navbar also might include status bar, that we don't want to include
 * in the height calculation because it hides when scrolling (as it is not sticky)
 *
 * https://stackoverflow.com/a/59253905
 */
export const useNavbarHeight = () => {
  const [navbarHeight, setNavbarHeight] = useState(0)

  const desktopNavbarRef = useRef<HTMLDivElement>(null)
  const mobileNavbarRef = useRef<HTMLDivElement>(null)

  const handleResize = () => {
    setNavbarHeight(
      Math.max(
        desktopNavbarRef.current?.getBoundingClientRect().height ?? 0,
        mobileNavbarRef.current?.getBoundingClientRect().height ?? 0,
      ),
    )
  }

  useResizeObserver({ ref: desktopNavbarRef, onResize: handleResize })
  useResizeObserver({ ref: mobileNavbarRef, onResize: handleResize })

  return { navbarHeight, desktopNavbarRef, mobileNavbarRef }
}
