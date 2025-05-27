# ManuallyVerifyUserRequestDto

## Properties

| Name            | Type       | Description     | Notes                             |
| --------------- | ---------- | --------------- | --------------------------------- |
| **birthNumber** | **string** | userBirthNumber | [default to '8808080000']         |
| **ifo**         | **string** | Ifo of the user | [optional] [default to undefined] |
| **ico**         | **string** | ico             | [optional] [default to undefined] |

## Example

```typescript
import { ManuallyVerifyUserRequestDto } from './api'

const instance: ManuallyVerifyUserRequestDto = {
  birthNumber,
  ifo,
  ico,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
