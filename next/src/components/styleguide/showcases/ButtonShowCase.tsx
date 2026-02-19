import { CalendarIcon, EditIcon, SearchIcon } from '@/src/assets/ui-icons'
import type { PolymorphicProps } from '@/src/components/forms/simple-components/Button'
import Button from '@/src/components/forms/simple-components/Button'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

type ButtonVariant = PolymorphicProps['variant']

// All button variants from Button.tsx, grouped for display
const variants: Record<string, ButtonVariant[]> = {
  basic: ['solid', 'outline', 'plain', 'solid-inverted', 'negative-solid', 'negative-plain'],
  link: ['link', 'link-inverted'],
  iconWrapped: ['icon-wrapped', 'icon-wrapped-negative-margin'],
}

type ButtonExampleProps = Omit<PolymorphicProps, 'aria-label'>

const basicButtonExamples = {
  'size-default': [
    { children: 'Default' },
    { isDisabled: true, children: 'Disabled' },
    { icon: true },
    { startIcon: true, children: 'Start icon' },
    { endIcon: true, children: 'End icon' },
    { startIcon: true, endIcon: true, children: 'Both icons' },
    { isLoading: true, loadingText: 'Loading…' },
  ],
  'size-small': [
    { size: 'small', children: 'Small' },
    { size: 'small', isDisabled: true, children: 'Small disabled' },
    { size: 'small', icon: true },
    { size: 'small', startIcon: true, children: 'Start icon' },
    { size: 'small', endIcon: true, children: 'End icon' },
    { size: 'small', startIcon: true, endIcon: true, children: 'Both icons' },
    { size: 'small', isLoading: true, loadingText: 'Loading…' },
  ],
} satisfies Record<string, ButtonExampleProps[]>

const StackableButton = ({
  variant,
  buttonExample,
}: {
  variant: ButtonVariant
  buttonExample: ButtonExampleProps
}) => {
  return buttonExample.icon ? (
    <Button
      variant={variant}
      icon={<SearchIcon />}
      aria-label="Search"
      size={buttonExample.size}
      isDisabled={buttonExample.isDisabled}
      isLoading={buttonExample.isLoading}
    />
  ) : (
    <Button
      variant={variant}
      size={buttonExample.size}
      isDisabled={buttonExample.isDisabled}
      isLoading={buttonExample.isLoading}
      loadingText={buttonExample.loadingText}
      startIcon={buttonExample.startIcon ? <SearchIcon /> : undefined}
      endIcon={buttonExample.endIcon ? <EditIcon /> : undefined}
    >
      {buttonExample.children}
    </Button>
  )
}

const ButtonShowCase = () => {
  return (
    <Wrapper direction="column" title="Button">
      <div>
        For link buttons, you can use <code>hasLinkIcon</code> to automatically add endIcon
        (ArrowRight or ExternalLink icon).
      </div>
      <div>
        Icon Button should use <code>icon</code> and <code>aria-label</code> props instead of{' '}
        <code>children</code> and cannot be used with <code>startIcon</code>, <code>endIcon</code>.
      </div>
      <div>
        &quot;Naked&quot; icon buttons (e.g. close, calendar) should have expanded clickable area.
        Use <code>icon-wrapped</code> or <code>icon-wrapped-negative-margin</code> variants.
      </div>

      {/* Basic variants */}
      {variants.basic.map((variant) => (
        <div key={variant}>
          <strong>variant=&quot;{variant}&quot;</strong>
          <Stack>
            {basicButtonExamples['size-default'].map((buttonExample, index) => (
              <StackableButton key={index} variant={variant} buttonExample={buttonExample} />
            ))}
            <div className="w-full" aria-hidden />
            {basicButtonExamples['size-small'].map((buttonExample, index) => (
              <StackableButton key={index} variant={variant} buttonExample={buttonExample} />
            ))}
          </Stack>
        </div>
      ))}

      {/* Unstyled */}
      <div>
        <strong>variant=&quot;unstyled&quot;</strong>
        <Stack>
          <Button variant="unstyled">Unstyled</Button>
          <Button variant="unstyled" size="small">
            Small
          </Button>
          <Button variant="unstyled" isDisabled>
            Disabled
          </Button>
        </Stack>
      </div>

      {/* Link variants */}
      {variants.link.map((variant) => (
        <div key={variant}>
          <strong>variant=&quot;{variant}&quot;</strong>
          <Stack>
            <Button variant={variant} href="#" hasLinkIcon>
              Link
            </Button>
            <Button variant={variant} href="#" size="small" hasLinkIcon>
              Link small
            </Button>
            <Button variant={variant} href="https://bratislava.sk" hasLinkIcon>
              External link
            </Button>
            <Button variant={variant} href="https://bratislava.sk" size="small" hasLinkIcon>
              External small
            </Button>
            <Button variant={variant} href="#anchor" hasLinkIcon>
              Anchor link
            </Button>
            <Button variant={variant} href="#anchor" size="small" hasLinkIcon>
              Anchor small
            </Button>
          </Stack>
        </div>
      ))}

      {/* Icon-wrapped variants */}
      {variants.iconWrapped.map((variant) => (
        <div key={variant}>
          <strong>variant=&quot;{variant}&quot;</strong>
          <Stack>
            <Button variant={variant} icon={<CalendarIcon />} aria-label="Calendar" />
            <Button variant={variant} icon={<CalendarIcon />} aria-label="Calendar" size="small" />
          </Stack>
        </div>
      ))}
    </Wrapper>
  )
}

export default ButtonShowCase
