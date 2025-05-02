# DeactivateAccountResponseDto

## Properties

| Name                          | Type        | Description                                                                                                                                               | Notes                  |
| ----------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **success**                   | **boolean** | Marks if the operation has been successful                                                                                                                | [default to undefined] |
| **bloomreachRemoved**         | **string**  | Status of the anonymization of user in bloomreach                                                                                                         | [default to undefined] |
| **taxDeliveryMethodsRemoved** | **boolean** | Status of the removal of tax delivery methods in Noris. If false, there was an error. If true it was successful, or the user is not a tax payer in Noris. | [default to undefined] |

## Example

```typescript
import { DeactivateAccountResponseDto } from './api'

const instance: DeactivateAccountResponseDto = {
  success,
  bloomreachRemoved,
  taxDeliveryMethodsRemoved,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
