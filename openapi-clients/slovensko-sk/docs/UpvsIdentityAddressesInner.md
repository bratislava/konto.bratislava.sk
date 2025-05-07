# UpvsIdentityAddressesInner

## Properties

| Name                    | Type                                                                                          | Description                                                                                                                                                                                                                                                 | Notes                             |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **type**                | **string**                                                                                    | Typ adresy: - &#x60;resident&#x60; adresa trvalého pobytu alebo sídla, - &#x60;contact&#x60; kontaktná adresa, - &#x60;post_office_box&#x60; adresa poštovej schránky, - &#x60;military&#x60; vojenská adresa, - &#x60;undefined&#x60; nedefinovaná adresa. | [optional] [default to undefined] |
| **inline**              | **string**                                                                                    | Formátovaná adresa.                                                                                                                                                                                                                                         | [optional] [default to undefined] |
| **country**             | [**UpvsEnumeration**](UpvsEnumeration.md)                                                     | Krajina podľa číselníka ŠÚSR 0086.                                                                                                                                                                                                                          | [optional] [default to undefined] |
| **region**              | **string**                                                                                    | Kraj.                                                                                                                                                                                                                                                       | [optional] [default to undefined] |
| **district**            | [**UpvsEnumeration**](UpvsEnumeration.md)                                                     | Okres podľa číselníka ŠÚSR 0024.                                                                                                                                                                                                                            | [optional] [default to undefined] |
| **municipality**        | [**UpvsEnumeration**](UpvsEnumeration.md)                                                     | Obec podľa číselníka ŠÚSR 0025.                                                                                                                                                                                                                             | [optional] [default to undefined] |
| **part**                | **string**                                                                                    | Časť obce.                                                                                                                                                                                                                                                  | [optional] [default to undefined] |
| **street**              | **string**                                                                                    | Ulica.                                                                                                                                                                                                                                                      | [optional] [default to undefined] |
| **building_number**     | **string**                                                                                    | Orientačné číslo.                                                                                                                                                                                                                                           | [optional] [default to undefined] |
| **registration_number** | **number**                                                                                    | Súpisné číslo.                                                                                                                                                                                                                                              | [optional] [default to undefined] |
| **unit**                | **string**                                                                                    | Časť budovy.                                                                                                                                                                                                                                                | [optional] [default to undefined] |
| **building_index**      | **number**                                                                                    | Index budovy.                                                                                                                                                                                                                                               | [optional] [default to undefined] |
| **delivery_address**    | [**UpvsIdentityAddressesInnerDeliveryAddress**](UpvsIdentityAddressesInnerDeliveryAddress.md) |                                                                                                                                                                                                                                                             | [optional] [default to undefined] |
| **ra_entry**            | **string**                                                                                    | Záznam v registri adries.                                                                                                                                                                                                                                   | [optional] [default to undefined] |
| **specified**           | **boolean**                                                                                   | Indikátor či ide o špecifikovanú adresu, ktorá bude nastavená.                                                                                                                                                                                              | [optional] [default to undefined] |

## Example

```typescript
import { UpvsIdentityAddressesInner } from './api'

const instance: UpvsIdentityAddressesInner = {
  type,
  inline,
  country,
  region,
  district,
  municipality,
  part,
  street,
  building_number,
  registration_number,
  unit,
  building_index,
  delivery_address,
  ra_entry,
  specified,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
