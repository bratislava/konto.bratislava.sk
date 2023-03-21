import { useEffect, useState } from 'react'

export function useWindowSize() {
  const [windowWidth, setWindowWidth] = useState<number | undefined>()
  const [windowHeight, setWindowHeight] = useState<number | undefined>()
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return {
    width: windowWidth,
    height: windowHeight,
  }
}
