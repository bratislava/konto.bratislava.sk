# RequestPostNorisPaymentDataLoadDto

## Properties

| Name             | Type       | Description                                       | Notes                     |
| ---------------- | ---------- | ------------------------------------------------- | ------------------------- |
| **year**         | **number** | Year of tax                                       | [default to 2022]         |
| **fromDate**     | **string** | From date - if is not set, take one from database | [default to '2022-01-01'] |
| **toDate**       | **string** | To date - if is not set, take one from database   | [default to '2022-01-02'] |
| **overPayments** | **object** | If you want to count also overpayments.           | [default to undefined]    |

## Example

```typescript
import { RequestPostNorisPaymentDataLoadDto } from './api'

const instance: RequestPostNorisPaymentDataLoadDto = {
  year,
  fromDate,
  toDate,
  overPayments,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
