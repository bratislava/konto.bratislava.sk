# @rjsf/utils patch

This is a compiled version of this branch:
https://github.com/bratislava/react-jsonschema-form/tree/bratislava-patch

The patch adds a `overrideArrayMinItemsBehaviour` keyword for array schemas. Here is how:
https://github.com/bratislava/react-jsonschema-form/commit/df33db5638ce3626a72f8b8411df498a8a8ae5fc

For more details read the comments for `defaultFormStateBehavior` in `next/frontend/utils/form.ts`.

If you want to update RJSF this needs to be recompiled.

In RJSF repository:

1. Checkout https://github.com/bratislava/react-jsonschema-form/tree/bratislava-patch
2. Rebase current version tag on top of it.
3. Install current packages via npm in `packages/utils/`.
4. Run `npm build` in `packages/utils/`.
5. Push the changes to the remote.

In Next app:

1. Remove the old .patch file.
2. Update RJSF via `yarn update-rjsf`.
3. Remove `dist`, `lib` and `src` folders from `next/node_modules/@rjsf/utils` and copy them from the built version.
4. Run `yarn patch-package @rjsf/utils` in `next` folder to generate a new patch.
5. Next cache folder `next/.next` might needs to be deleted.
