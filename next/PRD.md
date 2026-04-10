# PRD: Form Field Components Rewrite with react-aria-components

## Problem Statement

The current form field components (`InputField`, `TextAreaField`, `NumberField`, `RadioGroup`, `CheckboxGroup`) in `widget-components/` are built on low-level react-aria hooks (`useTextField`, `useRadio`, `useCheckbox`, etc.) with a flat, tightly coupled props API. They share primitives (`FieldWrapper`, `FieldHeader`, `FieldFooter`) that make them hard to extract or evolve independently.

These components serve two distinct consumer layers — react-hook-form auth forms and RJSF schema-driven forms — but their API is optimized for neither. Helptext requires boolean flags for markdown rendering, error messages are passed as `string[]` arrays, and layout concerns (field width) are mixed into the component API.

The goal is to rewrite these components using `react-aria-components` (the higher-level compositional layer, already installed at v1.16.0) with a clean, modern API that is independent enough to eventually be extracted into a separate npm package.

## Solution

Create a new set of form field components in `next/src/components/fields/` built on `react-aria-components`. These components will:

- Own their internal primitives (FieldHeader, FieldErrorMessage) with no imports from `widget-components/`
- Use a semi-compositional API where label, helptext, and error are props (not children), but the input slot can optionally be overridden via children
- Leverage react-aria-components' built-in accessibility wiring (automatic `aria-describedby`, `aria-errormessage`, `aria-invalid`)
- Use Figma design tokens mapped to Tailwind CSS classes for styling
- Support all relevant props from react-aria-components via type extension (`extends RACTextFieldProps`)
- Include a shared RJSF props mapping utility to simplify wrapper migration

Migration will be gradual: all new components built first, then auth forms migrated (simpler consumers), then RJSF wrappers migrated (more complex adapter layer). Old components remain untouched until their consumers are migrated.

## User Stories

1. As a developer building an auth form, I want to use a `TextField` component that accepts `label`, `errorMessage`, and standard HTML input props, so that I can build accessible forms with minimal boilerplate.

2. As a developer building an auth form, I want the `TextField` to forward refs to the underlying `<input>` element, so that react-hook-form's `Controller` can focus the field on validation errors.

3. As a developer, I want `errorMessage` to be a simple `string | undefined` instead of `string[]`, so that I don't need to wrap every error in an array.

4. As a developer, I want helptext to accept `ReactNode` instead of separate `helptext` + `helptextMarkdown` boolean props, so that I have full control over what gets rendered as a description.

5. As a developer, I want the components to use Figma design tokens (e.g., `border-border-active-default`) directly as Tailwind classes, so that the implementation matches the design system 1:1.

6. As a developer, I want the components to handle responsive padding via CSS media queries (mobile vs desktop at `lg` breakpoint), so that I don't need to pass a responsive prop to every field instance.

7. As a developer, I want a `PasswordField` that wraps `TextField` with a visibility toggle, so that I don't need to implement show/hide password logic in every form.

8. As a developer, I want `RadioGroup` to support `basic`, `boxed`, `card`, and boolean (horizontal boxed) layout variants, so that I can match all Figma design patterns.

9. As a developer, I want `CheckboxGroup` to support `basic` and `boxed` variants, so that I can use both plain checkboxes and card-style checkboxes.

10. As a developer, I want `RadioGroup` to default to `orientation="vertical"`, so that the most common layout doesn't require an explicit prop.

11. As a developer, I want the field components to not concern themselves with width/size, so that layout is handled by the parent container and I don't mix layout concerns into field props.

12. As a developer building RJSF widget wrappers, I want a `mapRjsfToFieldProps()` utility that converts RJSF's `WidgetProps` + `uiOptions` into the new component props, so that I don't repeat the same mapping logic in every wrapper.

13. As a developer building RJSF widget wrappers, I want to keep using `FieldBlurWrapper` externally around the new components, so that the blur-deferral performance optimization for complex JSON Schema conditions is preserved without the field components needing to know about it.

14. As a developer, I want the components to preserve `data-cy` test selectors (`data-cy="input-{name}"`, `data-cy="radio-{value}"`, `data-cy="error-message"`), so that existing Cypress tests continue to work after migration.

15. As a developer, I want `labelSize` to control visual weight (`default`, `h3`, `h4`, `h5`) without changing the semantic HTML tag, so that I can use heading-sized labels in RJSF nested forms without breaking document outline.

16. As a developer, I want the `displayOptionalLabel` prop to control whether "(optional)" text is shown for non-required fields, so that I can hide it in contexts like search forms where fields are optional by nature.

17. As a developer, I want the error message to be auto-capitalized with a period added if missing, so that error display is consistent regardless of how validation libraries format their messages.

18. As a developer, I want `NumberField` to use `null` instead of `NaN` for empty values, so that I don't need to handle `NaN` in my form state.

19. As a developer, I want all RAC props to be supported and passed through (via `extends RACTextFieldProps`), so that I can use any react-aria-component feature without the wrapper blocking it.

20. As a developer, I want the new components to be importable directly from their files (no barrel export), so that tree-shaking works optimally and import paths are explicit.

21. As a user filling out a form, I want proper ARIA labels, descriptions, and error announcements, so that I can use the form with a screen reader.

22. As a user, I want focus states to be clearly visible with keyboard focus rings, so that I can navigate forms with keyboard only.

23. As a user, I want hover states on form fields, so that I get visual feedback when interacting with mouse or touch.

24. As a user, I want disabled fields to be visually distinct and non-interactive, so that I understand which fields I cannot edit.

25. As a user, I want error messages to appear below the field they relate to and be associated via ARIA, so that I understand what needs to be corrected.

## Implementation Decisions

### Component architecture

- **Location**: `next/src/components/fields/` — independent from `widget-components/`
- **No barrel export**: Each component is imported directly from its file
- **RAC import convention**: Use `RAC` prefix for aliased imports (`RACTextField`, `RACInput`, etc.)

### Component API design

- **Semi-compositional (B1)**: Label, helptext, error, and helptextFooter are props. Children are optional and override the input slot when provided. Most usage requires no children.
- **Extend RAC prop types**: Each component extends the relevant RAC props type (`RACTextFieldProps`, `RACNumberFieldProps`, etc.) plus `FieldBaseProps`. Only custom props are defined in `FieldBaseProps`.
- **`FieldBaseProps`**: `label`, `displayOptionalLabel`, `labelSize`, `helptext` (ReactNode), `helptextFooter` (ReactNode), `errorMessage` (string). Props like `isRequired`, `isDisabled`, `className`, `name` come from RAC.

### Styling

- **Tailwind with render props**: Use react-aria-components' `className` render prop with `cn()` using object notation for conditionals: `cn({'border-border-error': isInvalid})`
- **Figma design tokens**: Map directly to Tailwind classes (`border-border-active-default`, `bg-background-passive-base`, `text-content-passive-secondary`, etc.)
- **Responsive padding**: CSS media queries at `lg` breakpoint — mobile `px-4 py-3`, desktop `px-3 py-2`
- **No width/size prop**: Components are always full-width; layout handles width constraints

### Error handling

- **`isInvalid={!!errorMessage}`** + `validationBehavior="aria"` on RAC parent component enables `<RACFieldError>` to render with externally-provided error strings
- **Error formatting**: Auto-capitalize first character, add period if missing (preserves existing behavior)
- **RJSF errors**: Wrappers join `rawErrors` with `', '` before passing as single string

### Helptext

- **`ReactNode` type**: Rendered into `<RACText slot="description">` internally
- **Markdown is a consumer concern**: RJSF wrappers render markdown via `<FormMarkdown>` before passing as ReactNode

### RJSF integration

- **`mapRjsfToFieldProps()` utility**: Shared function that maps `WidgetProps` + `uiOptions` to `FieldBaseProps`, handling markdown rendering, error joining, and common prop mapping
- **`FieldBlurWrapper` stays external**: The blur-deferral optimization remains in RJSF wrappers, not inside field components
- **`WidgetWrapper` unchanged**: Continues to handle `belowComponents`/`rightComponents`

### Specific component decisions

- **NumberField**: Omits RAC's `onChange` to use `null` instead of `NaN`. No stepper buttons — plain text input only.
- **PasswordField**: Wraps TextField. Toggles `type` between `'password'` and `'text'`. Renders eye icon button as `endIcon`.
- **RadioGroup**: `orientation` defaults to `'vertical'`. Boolean layout = `orientation="horizontal"` + boxed variant.
- **Radio**: `variant` prop (`basic` | `boxed` | `card`) controls visual style. Optional `description` prop for secondary text.
- **Checkbox**: `variant` prop (`basic` | `boxed`). Supports `isIndeterminate`.
- **TextField**: Trims leading spaces on change (preserves current behavior). `capitalize` prop removed — consumers handle capitalization themselves.

### Migration strategy

- **Phase 1**: Build all new components (no consumer changes)
- **Phase 2**: Migrate auth forms (simpler consumers, react-hook-form)
- **Phase 3**: Migrate RJSF wrappers (more complex, uses mapRjsfToFieldProps)
- Old components remain untouched until all their consumers are migrated

## Testing Decisions

### What makes a good test

Tests should verify external behavior from the user's perspective — what renders, what ARIA attributes are present, how keyboard/mouse interaction works — not implementation details like internal state or specific CSS classes.

### Components to test

- **TextField**: Render states (default, error, disabled), placeholder, value changes, leading space trim, ref forwarding, ARIA attributes
- **PasswordField**: Visibility toggle, type switching, eye icon presence
- **NumberField**: null↔NaN conversion, min/max constraints, value changes
- **RadioGroup**: Selection, keyboard navigation (arrow keys), variant rendering, orientation, null/empty deselection
- **CheckboxGroup**: Selection (multiple), indeterminate state, variant rendering
- **FieldHeader**: Optional label display, asterisk for required, label sizes
- **FieldErrorMessage**: Auto-capitalize, period addition, empty state

### RJSF utility to test

- **mapRjsfToFieldProps**: Correct mapping of all props, markdown rendering delegation, error joining

### Prior art

The current codebase has no Storybook and limited unit tests for these components. Cypress `data-cy` selectors exist on some elements. New tests should use React Testing Library if added.

## Out of Scope

- **SelectField**: Stays in `widget-components/`, uses react-select, not part of this rewrite
- **Upload components**: Stay untouched
- **DateTimePicker components**: Stay untouched
- **Storybook setup**: No Storybook currently exists; adding it is not part of this effort
- **Form-level components**: `WidgetWrapper`, `BAFieldTemplate`, and other RJSF form-level components are not rewritten
- **Design token additions**: If any Figma tokens are missing from `globals.css` (e.g., `content-disabled`), adding them is a separate task
- **`useHookForm` hook changes**: The hook's error format may need adaptation but is a separate concern

## Further Notes

- **Figma designs** are available for all components except NumberField. NumberField mirrors TextField's visual patterns.
- **react-aria-components v1.16.0** is already installed in the project. No new dependencies needed.
- **RadioGroup** has a `card` variant (unique to Radio, not available in Checkbox) where the radio button sits above the text content in a larger card layout.
- The `cn()` utility at `next/src/utils/cn.ts` uses `clsx` + `tailwind-merge` and is the only styling utility needed.
- The `lg` breakpoint (76rem / 1216px) is the threshold for responsive padding changes.
