import type { iframeResizer } from '@iframe-resizer/child'
import Script from 'next/script'
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const IframeResizerChildContext = createContext<iframeResizer.ParentProps | null>(null)

export const useIframeResizerChildContext = () => {
  return useContext(IframeResizerChildContext)
}

interface IframeResizerChildProps extends PropsWithChildren {
  enabled?: boolean
}

/*
 * Component that loads the `@iframe-resizer/child` library, handles load and clean up, and creates a context with
 * parent props.
 */
const IframeResizerChild = ({ children, enabled = false }: IframeResizerChildProps) => {
  const cleanupRef = useRef<(() => void) | null>(null)
  const [parentProps, setParentProps] = useState<iframeResizer.ParentProps | null>(null)

  const handleLibraryOnReady = () => {
    if (window.parentIFrame) {
      cleanupRef.current = window.parentIFrame.getParentProps((props) => {
        setParentProps(props)
      })
    }
  }

  const handleScriptOnLoad = () => {
    window.iFrameResizer = {
      onReady: handleLibraryOnReady,
    }
  }

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
      if (window.iFrameResizer) {
        // @ts-expect-error `undefined` is not a valid type according to library author
        window.iFrameResizer = undefined
      }
    }
  }, [])

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <IframeResizerChildContext.Provider value={parentProps}>
      {/* Must be copied in next.config.js to work correctly. */}
      <Script src="/scripts/iframe-resizer-child.js" async onLoad={handleScriptOnLoad} />
      {children}
    </IframeResizerChildContext.Provider>
  )
}

export default IframeResizerChild