import { Button } from '@bratislava/component-library'

import { Heading } from '@/src/components/common/TableOfContents/useHeadings'

// Prevents from scrolling the clicked table of contents item to the very top of window,
// which would hide it behind navbar on small screens. Works also for desktop, so is used for both.
const SCROLL_OFFSET = 120

type Props = {
  headings: Heading[]
  /**
   * Offset added to the `SCROLL_OFFSET`, e.g. the height of the table of contents that covers the
   * content while it is sticky. Read on press, because it changes with the expanded state.
   */
  getAdditionalScrollOffset?: () => number
  onItemPress?: () => void
}

const TableOfContentsLinks = ({ headings, getAdditionalScrollOffset, onItemPress }: Props) => {
  const handleItemPress = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (!element) {
      return
    }

    const elementPosition = element.getBoundingClientRect().top // current offset regarding the current window scroll
    const windowOffset = window.scrollY
    const additionalScrollOffset = getAdditionalScrollOffset?.() ?? 0
    const offsetPosition = elementPosition + windowOffset - SCROLL_OFFSET - additionalScrollOffset

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    onItemPress?.()
  }

  return (
    <ul className="flex flex-col px-4 py-2 lg:px-6">
      {headings.map((heading) => {
        return (
          <li key={heading.id} className="py-2 lg:py-3">
            <Button
              variant="link"
              onPress={() => {
                handleItemPress(heading.id)
              }}
              // TODO remove when Button is updated in https://github.com/bratislava/component-library/pull/48
              className="text-left"
            >
              {heading.text}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

export default TableOfContentsLinks
