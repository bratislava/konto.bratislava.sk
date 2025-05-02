# UpvsIdentityAddressesInnerDeliveryAddress

Doručovacia adresa.

## Properties

| Name                | Type                                                                                                            | Description            | Notes                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------- |
| **postal_code**     | **string**                                                                                                      | Poštové smerové číslo. | [optional] [default to undefined] |
| **post_office_box** | **string**                                                                                                      | Poštová schránka.      | [optional] [default to undefined] |
| **recipient**       | [**UpvsIdentityAddressesInnerDeliveryAddressRecipient**](UpvsIdentityAddressesInnerDeliveryAddressRecipient.md) |                        | [optional] [default to undefined] |

## Example

```typescript
import { UpvsIdentityAddressesInnerDeliveryAddress } from './api'

const instance: UpvsIdentityAddressesInnerDeliveryAddress = {
  postal_code,
  post_office_box,
  recipient,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
