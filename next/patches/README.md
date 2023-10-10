# @rjsf/utils patch
This is a compiled version of this branch:
https://github.com/bratislava/react-jsonschema-form/tree/get-default-form-state-fix

It fixes this issue:
https://github.com/rjsf-team/react-jsonschema-form/issues/3832

If you want to update RJSF this probably needs to be recompiled.

1. Checkout https://github.com/bratislava/react-jsonschema-form/tree/get-default-form-state-fix
2. Rebase current version tag on top of it
3. Install current packages via npm in `packages/utils/`
4. Run `npm build` in `packages/utils/`
5. Remove the old .patch file.
6. Update RJSF via `yarn update-rjsf`.
7. Remove `dist`, `lib` and `src` folders from `next/node_modules/@rjsf/utils` and copy them from the build version.
8. Run `yarn patch-package @rjsf/utils` in `next` folder.
