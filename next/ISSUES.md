# Implementation Issues: Fields Rewrite

Parent PRD: [PRD.md](./PRD.md)

---

## Issue 1: Foundation — shared types and primitives

**Type**: AFK
**Blocked by**: None

### What to build

Create the shared foundation that all field components depend on:
- `fields/_shared/types.ts` — `FieldBaseProps` interface and `LabelSize` type
- `fields/_shared/FieldHeader.tsx` — label rendering with optional/required indicators, helptext via `<RACLabel>` + `<RACText slot="description">`, label size visual weight
- `fields/_shared/FieldErrorMessage.tsx` — error string formatting (auto-capitalize, add period) rendered inside `<RACFieldError>`, `data-cy="error-message"` preserved

### Acceptance criteria

- [ ] `FieldBaseProps` defined with: `label`, `displayOptionalLabel`, `labelSize`, `helptext` (ReactNode), `helptextFooter` (ReactNode), `errorMessage` (string)
- [ ] `FieldHeader` renders label with `text-16-semibold` (default), `text-h3`, `text-h4`, `text-h5` visual weights
- [ ] `FieldHeader` shows "(optional)" text when `displayOptionalLabel=true` and `isRequired=false`
- [ ] `FieldHeader` shows asterisk when `displayOptionalLabel=false` and `isRequired=true`
- [ ] `FieldHeader` renders helptext as ReactNode into `<RACText slot="description">`
- [ ] `FieldErrorMessage` auto-capitalizes first character and adds period if missing
- [ ] `FieldErrorMessage` renders nothing when `errorMessage` is `undefined`
- [ ] `FieldErrorMessage` preserves `data-cy="error-message"` attribute
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 15, 16, 17, 21

---

## Issue 2: TextField + PasswordField

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/TextField.tsx` and `fields/PasswordField.tsx`.

**TextField**: Built on `<RACTextField>` + `<RACInput>`. Extends `RACTextFieldProps` + `FieldBaseProps`. Adds `placeholder`, `endIcon`, and optional `children` override. Trims leading spaces on change. Forwards ref to `<RACInput>`. Supports all RAC TextField props passthrough. Uses Figma design tokens for styling with responsive padding (`px-4 py-3 lg:px-3 lg:py-2`). Sets `isInvalid={!!errorMessage}` and `validationBehavior="aria"` for external error display. Renders `helptextFooter` between input and error.

**PasswordField**: Wraps TextField. Omits `type` and `endIcon`. Toggles input type between `password` and `text`. Renders eye/eye-off toggle button as `endIcon`.

### Acceptance criteria

- [ ] `TextFieldProps extends RACTextFieldProps, FieldBaseProps` with only custom additions (`placeholder`, `endIcon`, `children`)
- [ ] All RAC TextField props pass through (value, onChange, isRequired, isDisabled, name, type, autoComplete, etc.)
- [ ] Ref forwarded to underlying `<RACInput>` element (react-hook-form `Controller` compatible)
- [ ] Leading spaces trimmed on change
- [ ] States styled correctly: default (`border-border-active-default`), hover (`border-border-active-hover`), focused (`border-border-active-focused`), error (`border-border-error`), disabled (`border-border-active-disabled` + `bg-background-passive-tertiary`)
- [ ] Responsive padding: mobile `px-4 py-3`, desktop (lg) `px-3 lg:py-2`
- [ ] `helptextFooter` rendered below input, above error message
- [ ] `data-cy="input-{name}"` attribute preserved
- [ ] PasswordField toggles visibility with eye icon button
- [ ] PasswordField eye icon is keyboard accessible
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 2, 3, 4, 5, 6, 7, 19, 21, 22, 23, 24, 25

---

## Issue 3: TextAreaField

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/TextAreaField.tsx`. Built on `<RACTextField>` + `<RACTextArea>`. Same API pattern as TextField (extends `RACTextFieldProps` + `FieldBaseProps`) minus `endIcon`. Same styling tokens and responsive padding. TextArea is resizable vertically.

### Acceptance criteria

- [ ] `TextAreaFieldProps extends RACTextFieldProps, FieldBaseProps` with `placeholder` and optional `children`
- [ ] All RAC TextField props pass through
- [ ] Same state styling as TextField (default, hover, focused, error, disabled)
- [ ] Responsive padding matches TextField
- [ ] `helptextFooter` rendered below textarea, above error
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 3, 4, 5, 6, 19, 21, 22, 23, 24, 25

---

## Issue 4: NumberField

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/NumberField.tsx`. Built on `<RACNumberField>` + `<RACInput>` (no stepper buttons). Extends `Omit<RACNumberFieldProps, 'onChange'>` + `FieldBaseProps`. Converts between `null` (consumer API) and `NaN` (RAC internal) for empty values. Adds `placeholder` and `endIcon`. Same visual styling as TextField.

### Acceptance criteria

- [ ] `NumberFieldProps extends Omit<RACNumberFieldProps, 'onChange'>, FieldBaseProps`
- [ ] `onChange` uses `number | null` (not NaN)
- [ ] `value={null}` renders empty input; typing and clearing returns `null` via onChange
- [ ] RAC NumberField props pass through (minValue, maxValue, step, formatOptions, etc.)
- [ ] No stepper/increment/decrement buttons rendered
- [ ] Same state styling and responsive padding as TextField
- [ ] `helptextFooter` rendered below input, above error
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 3, 4, 5, 6, 18, 19, 21, 22, 23, 24, 25

---

## Issue 5: RadioGroup + Radio

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/RadioGroup.tsx` exporting `RadioGroup` and `Radio`.

**RadioGroup**: Built on `<RACRadioGroup>`. Extends `Omit<RACRadioGroupProps, 'orientation'>` + `FieldBaseProps`. Defaults `orientation` to `'vertical'`. Renders FieldHeader and FieldErrorMessage. Group helptext uses `text-p3` (14px).

**Radio**: Built on `<RACRadio>`. Extends `RACRadioProps` with `variant` (`basic` | `boxed` | `card`) and `description`. 
- **basic**: 24px circle + label text, `gap-4` between items
- **boxed**: radio + label inside bordered card, optional headline + description, responsive padding
- **card**: vertical layout — radio on top, text below, `p-4`, `gap-4` inside
- **boolean**: achieved via `orientation="horizontal"` + boxed variant

Radio indicator: 24px circle, `rounded-full`, 2px border `border-border-active-primary-default`, selected inner dot at ~16.67% inset with `bg-background-active-primary-default`. Hover, disabled (opacity 50%), error states.

### Acceptance criteria

- [ ] `RadioGroupProps extends Omit<RACRadioGroupProps, 'orientation'>, FieldBaseProps` with `orientation` defaulting to `'vertical'`
- [ ] `RadioProps extends RACRadioProps` with `variant` and `description`
- [ ] Basic variant: plain radio + label, vertical layout with `gap-4`
- [ ] Boxed variant: bordered card, responsive padding, optional description text, selected border `border-border-active-primary-default`
- [ ] Card variant: vertical card with radio on top, text below, `p-4`
- [ ] Boolean layout works via `orientation="horizontal"` + boxed Radio children
- [ ] Radio states: default, hover (`border-border-active-primary-hover`), disabled (opacity 50%), error (`border-border-error`, `bg-background-error-default`)
- [ ] Keyboard navigation: arrow keys cycle through options
- [ ] `data-cy="radio-{value}"` attribute preserved
- [ ] Group helptext uses `text-p3`
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 5, 6, 8, 10, 14, 19, 21, 22, 23, 24, 25

---

## Issue 6: CheckboxGroup + Checkbox

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/CheckboxGroup.tsx` exporting `CheckboxGroup` and `Checkbox`.

**CheckboxGroup**: Built on `<RACCheckboxGroup>`. Extends `RACCheckboxGroupProps` + `FieldBaseProps`. Vertical layout with `gap-4` (basic) or `gap-3` (boxed). Group helptext uses `text-p3`.

**Checkbox**: Built on `<RACCheckbox>`. Extends `RACCheckboxProps` with `variant` (`basic` | `boxed`).
- **basic**: 24px checkbox + label text
- **boxed**: checkbox + label inside bordered card, responsive padding

Checkbox indicator: 24px, `rounded` (4px), 2px border `border-border-active-primary-default`. Selected: filled `bg-background-active-primary-default` with white checkmark SVG. Indeterminate: filled with white dash SVG. Hover, disabled, error states matching Radio.

### Acceptance criteria

- [ ] `CheckboxGroupProps extends RACCheckboxGroupProps, FieldBaseProps`
- [ ] `CheckboxProps extends RACCheckboxProps` with `variant`
- [ ] Basic variant: plain checkbox + label
- [ ] Boxed variant: bordered card, responsive padding, selected border change
- [ ] Indeterminate state renders dash icon instead of checkmark
- [ ] Checkbox states: default, hover, disabled (opacity 50%), error (red border + fill)
- [ ] Keyboard navigation: Space toggles selection
- [ ] `data-cy="checkbox-{value}"` attribute preserved
- [ ] Group helptext uses `text-p3`
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 1, 5, 6, 9, 14, 19, 21, 22, 23, 24, 25

---

## Issue 7: RJSF props mapping utility

**Type**: AFK
**Blocked by**: Issue 1

### What to build

Create `fields/useRjsfFieldProps.ts` with a `mapRjsfToFieldProps()` function that converts RJSF `WidgetProps` + `uiOptions` into `FieldBaseProps`. Handles:
- `rawErrors` → `errorMessage` (joined with `', '`)
- `helptext` + `helptextMarkdown` → `helptext` (ReactNode, markdown rendered by caller-provided function)
- Same for `helptextFooter` + `helptextFooterMarkdown`
- `required` → `isRequired`, `disabled || readonly` → `isDisabled`
- `labelSize`, `displayOptionalLabel: true`

### Acceptance criteria

- [ ] `mapRjsfToFieldProps()` exported with clear TypeScript signature
- [ ] Accepts `Pick<WidgetProps, 'label' | 'required' | 'disabled' | 'readonly' | 'rawErrors'>` + options + markdown render function
- [ ] Returns `FieldBaseProps` (plus `isRequired` and `isDisabled`)
- [ ] `rawErrors` joined with `', '` into single `errorMessage` string
- [ ] Markdown helptext rendered via provided callback
- [ ] Plain string helptext passed through as-is
- [ ] `displayOptionalLabel` defaults to `true`
- [ ] No imports from `widget-components/`

### User stories addressed

- User story 12, 13

---

## Issue 8: Migrate auth forms to new field components

**Type**: AFK
**Blocked by**: Issue 2, Issue 5

### What to build

Migrate all auth forms from `widget-components` imports to new `fields` imports. Forms to migrate:
1. `LoginForm.tsx`
2. `ForgottenPasswordForm.tsx`
3. `EmailVerificationForm.tsx`
4. `EmailChangeForm.tsx`
5. `PasswordChangeForm.tsx`
6. `NewPasswordForm.tsx`
7. `PhoneNumberForm.tsx`
8. `RegisterForm.tsx` (most complex — uses RadioGroup + Radio)
9. `IdentityVerificationOfPhysicalEntityForm.tsx`

Key changes: `InputField` → `TextField`, direct imports from `fields/`, `capitalize` prop removed (consumers handle own `onBlur`), verify `errorMessage` type compatibility with `useHookForm`, verify ref forwarding works with `Controller`.

### Acceptance criteria

- [ ] All auth forms import from `fields/` instead of `widget-components/`
- [ ] No remaining imports of `InputField`, `PasswordField`, `Radio`, `RadioGroup` from `widget-components/` in auth forms
- [ ] All forms render correctly (label, helptext, error, disabled states)
- [ ] Form validation and submission works end-to-end
- [ ] Focus-on-error works via react-hook-form Controller ref
- [ ] `data-cy` selectors preserved
- [ ] No visual regression

### User stories addressed

- User story 1, 2, 3, 7, 14

---

## Issue 9: Migrate RJSF wrappers to new field components

**Type**: AFK
**Blocked by**: Issue 2, Issue 3, Issue 4, Issue 5, Issue 6, Issue 7

### What to build

Migrate all relevant RJSF widget wrappers to use new field components + `mapRjsfToFieldProps()`. Wrappers to migrate:
1. `InputWidgetRJSF.tsx`
2. `TextAreaWidgetRJSF.tsx`
3. `NumberWidgetRJSF.tsx`
4. `RadioGroupWidgetRJSF.tsx`
5. `CheckboxGroupWidgetRJSF.tsx`
6. `CheckboxWidgetRJSF.tsx`

Key changes: use `mapRjsfToFieldProps()` for common prop mapping, `FieldBlurWrapper` stays external, `WidgetWrapper` stays as-is, `size` prop removed, markdown rendering moved to wrapper level.

### Acceptance criteria

- [ ] All 6 RJSF wrappers import from `fields/` instead of `widget-components/`
- [ ] All wrappers use `mapRjsfToFieldProps()` for common prop mapping
- [ ] `FieldBlurWrapper` still wraps TextField and TextAreaField in their respective wrappers
- [ ] `WidgetWrapper` still handles `belowComponents`/`rightComponents`
- [ ] Markdown helptext rendered via `<FormMarkdown>` before passing as ReactNode
- [ ] RJSF form preview renders all field types correctly
- [ ] Conditional visibility (`if/then` schemas) still works
- [ ] No visual regression
- [ ] `data-cy` selectors preserved

### User stories addressed

- User story 12, 13, 14
