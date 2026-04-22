# SPEC — date/time fields → RAC

## §G goal

Rewrite DateField/TimeField/DatePicker on react-aria-components. Match sibling `fields/` pattern. Wire min/max end-to-end.

## §C constraints

- RAC v1.16.0, react-aria v3.47, @internationalized/date v3.12. No package bump.
- Old `next/src/components/widget-components/DateTimePicker/**` untouched.
- Locale provided by `<I18nProvider locale="sk-SK">` in `next/src/pages/_app.tsx:119`. No per-field wiring.
- Slovak strings live in `next/public/locales/sk/account.json`.
- RJSF adapter = `next/src/components/widget-wrappers/mapRjsfToReactAriaProps.tsx`. Shared `FieldWrapper` = `next/src/components/fields/_shared/FieldWrapper.tsx`.
- No barrel/index files.
- Snapshot regression harness: `npm run docker:test` from `forms-shared/`.
- Single-date only. No range pickers.
- No `ZonedDateTime`. Values stay tz-agnostic (`CalendarDate` / `Time`).
- Time granularity `minute`. No seconds.
- Calendar nav = prev/next only. No month/year dropdowns.

## §I interfaces

- `I.fields.DateField` — `next/src/components/fields/DateField.tsx`. Props: `RACDateFieldProps<DateValue> & FieldBaseProps`. Value: `DateValue | null`.
- `I.fields.TimeField` — `next/src/components/fields/TimeField.tsx`. Props: `RACTimeFieldProps<TimeValue> & FieldBaseProps`. Granularity `minute`.
- `I.fields.DatePicker` — `next/src/components/fields/DatePicker/DatePicker.tsx`. Props: `RACDatePickerProps<DateValue> & FieldBaseProps`.
- `I.fields.Calendar` — `next/src/components/fields/DatePicker/Calendar.tsx`. Consumed only inside DatePicker's Dialog.
- `I.rjsf.DatePickerWidgetRJSF` — `next/src/components/widget-wrappers/DatePickerWidgetRJSF.tsx`. `string | undefined` ↔ `DateValue | null`.
- `I.rjsf.TimePickerWidgetRJSF` — `next/src/components/widget-wrappers/TimePickerWidgetRJSF.tsx`. `string | undefined` ↔ `TimeValue | null`. Keeps `FieldBlurWrapper`.
- `I.ui.DatePickerUiOptions` / `I.ui.TimePickerUiOptions` — `forms-shared/src/generator/uiOptionsTypes.ts`. Add `minValue?: string`, `maxValue?: string`.
- `I.i18n.DatePicker.clear` — new key in `sk/account.json`. Existing `DatePicker.aria.openCalendar` reused.

## §V invariants

- V1. Field layer value type = native RAC union (`DateValue | null`, `TimeValue | null`). No string props on Field surface.
- V2. String↔RAC conversion lives only in RJSF adapter `toFieldValue`/`fromFieldValue`. Never inside Field components.
- V3. Malformed ISO input in adapter → `null`, never throws. Parse helpers wrap `parseDate`/`parseTime` in try/catch.
- V4. Time `fromFieldValue` strips seconds. Output format = `HH:MM`.
- V5. All three Fields set `isInvalid={!!errorMessage}` and `validationBehavior="aria"`.
- V6. All three Fields render through shared `FieldWrapper` — label, helptext, helptextFooter, errorMessage, optional/asterisk logic not duplicated.
- V7. Segments rendered via RAC `<DateInput>{seg => <DateSegment segment={seg}/>}</DateInput>`. No custom `useDateSegment`.
- V8. Calendar popover closes on select (RAC default `shouldCloseOnSelect=true`). No Confirm button.
- V9. Clear button in Calendar reads `DatePickerStateContext` and calls `setValue(null)`. Pattern: mirror `fields/RadioGroup.tsx:22` `ResetButton`.
- V10. min/max on RJSF widget: parse uiOption string → RAC value → forward to Field `minValue`/`maxValue` prop.
- V11. `DatePickerWidgetRJSF` NOT wrapped in `FieldBlurWrapper`. `TimePickerWidgetRJSF` IS wrapped. Preserves prior behavior.
- V12. No changes to `widget-components/DateTimePicker/**`.
- V13. Locale never read explicitly in new code. RAC reads I18nProvider.
- V14. Calendar heading capitalized (Slovak locale lowercases month names). Apply via CSS `first-letter:uppercase` or render-prop.
- V15. DatePicker trigger button = RAC `<Button>` inside `<Group>` (auto-slot). No BA component-library button injection.
- V16. No barrel files. Imports reference file paths directly.
- V17. Snapshot tests in `forms-shared` must pass post-rewrite (churn OK if only markup structure; behavior-preserving).
- V18. Field container styling tokens = `border-border-active-default|-focused|-error|-disabled`, `bg-background-passive-base`, `rounded-lg`, `px-3 py-2 lg:px-4 lg:py-3`. Mirrors `fields/TextField.tsx`.
- V19. No custom keyboard/focus handling in new code. A11y = RAC defaults.
- V20. Scope guardrails (tripwires): no range pickers, no ZonedDateTime, no seconds granularity, no month/year dropdowns. Violating any = scope creep.

## §T tasks

```
id|status|desc|cites
T1|x|add minValue/maxValue to DatePickerUiOptions + TimePickerUiOptions|I.ui.DatePickerUiOptions,I.ui.TimePickerUiOptions
T2|x|create fields/DateField.tsx wrapping RAC DateField+DateInput+DateSegment|I.fields.DateField,V1,V5,V6,V7
T3|x|create fields/TimeField.tsx wrapping RAC TimeField granularity=minute|I.fields.TimeField,V1,V5,V6,V7
T4|x|create fields/DatePicker/Calendar.tsx with prev/next/heading/grid/clear|I.fields.Calendar,V8,V9,V14
T5|x|create fields/DatePicker/DatePicker.tsx composing Group+Button+Popover+Dialog+Calendar|I.fields.DatePicker,V5,V6,V8,V15
T6|x|add DatePicker.clear key to sk/account.json|I.i18n.DatePicker.clear
T7|x|rewrite DatePickerWidgetRJSF using mapRjsfToReactAriaProps + safeParseDate|I.rjsf.DatePickerWidgetRJSF,V2,V3,V10,V11
T8|x|rewrite TimePickerWidgetRJSF using mapRjsfToReactAriaProps + FieldBlurWrapper + strip-seconds|I.rjsf.TimePickerWidgetRJSF,V2,V3,V4,V10,V11
T9|x|typecheck next + forms-shared|V17
T10|x|run docker:test snapshot regression; review diffs|V17
T11|~|manual QA: sk locale segment order, calendar open/close/select/clear, disabled/required/error states, min/max disables cells|V8,V9,V10,V13
T12|x|unit test RJSF adapter callbacks: parseDate/parseTime roundtrip, malformed/empty → null, seconds stripped|V2,V3,V4
T13|x|unit test Calendar clear button via DatePickerStateContext emits null|V9
T14|x|unit test segment order under sk-SK vs en-US I18nProvider|V13
T15|x|unit test min/max disables out-of-range cells/hours|V10
```

## §B bugs

```
id|date|cause|fix
```
