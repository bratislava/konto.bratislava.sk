// This stub is needed because "@x0k/json-schema-merge" is imported by forms-shared,
// yet it is never used by the tested code. Jest doesn't support ES Modules in NestJS context.
// See: https://github.com/nestjs/nest/pull/16391
//
// Mock for @x0k/json-schema-merge to satisfy @rjsf/utils imports in Jest
// @rjsf/utils imports and calls these methods upon initialization:
// import { createComparator, createMerger, createShallowAllOfMerge } from '@x0k/json-schema-merge';
// import { createDeduplicator, createIntersector } from '@x0k/json-schema-merge/lib/array';

import { identity } from "lodash"

module.exports = {
  createComparator: () => ({
    compareSchemaDefinitions: () => 0,
    compareSchemaValues: () => 0,
  }),
  createMerger: () => ({
    mergeArrayOfSchemaDefinitions: () => [],
  }),
  createShallowAllOfMerge: () => identity,
  createDeduplicator: () => () => {},
  createIntersector: () => () => {},
}
