# @rjsf/utils patch
This is a compiled version of this branch:
https://github.com/bratislava/react-jsonschema-form/tree/get-default-form-state-fix

It fixes this issue:
https://github.com/rjsf-team/react-jsonschema-form/issues/3832

The patch also adds a `overrideArrayMinItemsBehaviour` keyword for array schemas. For more details read the comments for `defaultFormStateBehavior` in `next/frontend/utils/form.ts`.

If you want to update RJSF this probably needs to be recompiled.

In RJSF repository:
1. Checkout https://github.com/bratislava/react-jsonschema-form/tree/get-default-form-state-fix
2. Rebase current version tag on top of it.
3. Install current packages via npm in `packages/utils/`.
4. Run `npm build` in `packages/utils/`.

In Next app:
1. Remove the old .patch file.
2. Update RJSF via `yarn update-rjsf`.
3. Remove `dist`, `lib` and `src` folders from `next/node_modules/@rjsf/utils` and copy them from the built version.
4. Run `yarn patch-package @rjsf/utils` in `next` folder to generate a new patch.
5. Next cache folder `next/.next` might needs to be deleted.
