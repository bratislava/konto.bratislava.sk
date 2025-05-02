# ResponseGetTaxesDto

## Properties

| Name          | Type                                                                   | Description                                               | Notes                  |
| ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------- |
| **isInNoris** | **boolean**                                                            | Birth number of user is in Noris actual or historical Tax | [default to undefined] |
| **items**     | [**Array&lt;ResponseGetTaxesBodyDto&gt;**](ResponseGetTaxesBodyDto.md) |                                                           | [default to undefined] |

## Example

```typescript
import { ResponseGetTaxesDto } from './api'

const instance: ResponseGetTaxesDto = {
  isInNoris,
  items,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
