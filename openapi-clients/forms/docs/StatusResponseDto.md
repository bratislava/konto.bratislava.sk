# StatusResponseDto

## Properties

| Name        | Type                                          | Description | Notes                  |
| ----------- | --------------------------------------------- | ----------- | ---------------------- |
| **prisma**  | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **minio**   | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **scanner** | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |

## Example

```typescript
import { StatusResponseDto } from './api'

const instance: StatusResponseDto = {
  prisma,
  minio,
  scanner,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
