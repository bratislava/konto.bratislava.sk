# ServicesStatusDto

## Properties

| Name              | Type                                          | Description | Notes                  |
| ----------------- | --------------------------------------------- | ----------- | ---------------------- |
| **prisma**        | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **minio**         | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **forms**         | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **clamav**        | [**ServiceRunningDto**](ServiceRunningDto.md) |             | [default to undefined] |
| **clamavVersion** | [**ClamavVersionDto**](ClamavVersionDto.md)   |             | [default to undefined] |

## Example

```typescript
import { ServicesStatusDto } from './api'

const instance: ServicesStatusDto = {
  prisma,
  minio,
  forms,
  clamav,
  clamavVersion,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
