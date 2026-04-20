import { DependencyList, useCallback, useState } from 'react'
import { useEventListener, useIsomorphicLayoutEffect } from 'usehooks-ts'

interface Size {
  width: number
  height: number
}

// This hook helps you to dynamically recover the width and the height of an HTML element.
// Dimensions are updated on load, on mount/un-mount, when resizing the window and when the ref or deps array (not supported by default) changes.
function useElementSize<T extends HTMLElement = HTMLDivElement>(
  deps: DependencyList = [],
): [(node: T | null) => void, Size] {
  // Mutable values like 'ref.current' aren't valid dependencies
  // because mutating them doesn't re-render the component.
  // Instead, we use a state as a ref to be reactive.
  const [ref, setRef] = useState<T | null>(null)
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  })

  // Prevent too many rendering using useCallback
  const handleSize = useCallback(() => {
    setSize({
      width: ref?.offsetWidth || 0,
      height: ref?.offsetHeight || 0,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth])

  useEventListener('resize', handleSize)

  useIsomorphicLayoutEffect(() => {
    handleSize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth, ...deps])

  return [setRef, size]
}

export default useElementSize
