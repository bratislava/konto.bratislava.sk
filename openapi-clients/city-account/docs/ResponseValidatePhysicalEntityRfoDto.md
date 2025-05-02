# ResponseValidatePhysicalEntityRfoDto

## Properties

| Name               | Type       | Description                                                   | Notes                  |
| ------------------ | ---------- | ------------------------------------------------------------- | ---------------------- |
| **physicalEntity** | **object** | Entity data (updated if new info was found in state registry) | [default to undefined] |
| **rfoData**        | **object** | Data received from RFO                                        | [default to undefined] |
| **upvsResult**     | **object** | Data received from UPVS                                       | [default to undefined] |

## Example

```typescript
import { ResponseValidatePhysicalEntityRfoDto } from './api'

const instance: ResponseValidatePhysicalEntityRfoDto = {
  physicalEntity,
  rfoData,
  upvsResult,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
