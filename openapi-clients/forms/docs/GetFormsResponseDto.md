# GetFormsResponseDto

## Properties

| Name            | Type                                                                     | Description                 | Notes                  |
| --------------- | ------------------------------------------------------------------------ | --------------------------- | ---------------------- |
| **currentPage** | **number**                                                               | actual page                 | [default to 1]         |
| **pagination**  | **number**                                                               | number of items in one page | [default to 100]       |
| **countPages**  | **number**                                                               | Total number of items       | [default to 100]       |
| **items**       | [**Array&lt;GetFormResponseSimpleDto&gt;**](GetFormResponseSimpleDto.md) | Items                       | [default to undefined] |
| **meta**        | [**GetFormMetaDto**](GetFormMetaDto.md)                                  | Meta data                   | [default to undefined] |

## Example

```typescript
import { GetFormsResponseDto } from './api'

const instance: GetFormsResponseDto = {
  currentPage,
  pagination,
  countPages,
  items,
  meta,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
