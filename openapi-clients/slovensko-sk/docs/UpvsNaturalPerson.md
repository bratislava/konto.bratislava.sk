# UpvsNaturalPerson

ÚPVS identita fyzickej osoby.

## Properties

| Name               | Type                                                                           | Description                                                                                                                                                                                                                                                                                       | Notes                             |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **natural_person** | **object**                                                                     | Fyzická osoba.                                                                                                                                                                                                                                                                                    | [optional] [default to undefined] |
| **ids**            | [**Array&lt;UpvsIdentityIdsInner&gt;**](UpvsIdentityIdsInner.md)               | Sektorové identifikátory.                                                                                                                                                                                                                                                                         | [optional] [default to undefined] |
| **uri**            | **string**                                                                     | URI identifikátor.                                                                                                                                                                                                                                                                                | [optional] [default to undefined] |
| **en**             | **string**                                                                     | Číslo eDesk schránky.                                                                                                                                                                                                                                                                             | [optional] [default to undefined] |
| **type**           | **string**                                                                     | Typ: - &#x60;natural_person&#x60; fyzická osoba, - &#x60;legal_entity&#x60; právnická osoba, - &#x60;technical_account&#x60; technický účet, - &#x60;employee_of_public_administration&#x60; zamestnanec verejnej správy, - &#x60;institution_of_public_administration&#x60; orgán verejnej moci. | [optional] [default to undefined] |
| **status**         | **string**                                                                     | Stav: - &#x60;registered&#x60; registrovaný, - &#x60;activated&#x60; aktivovaný, - &#x60;verified&#x60; overený, - &#x60;blocked&#x60; blokovaný, - &#x60;deactivated&#x60; deaktivovaný.                                                                                                         | [optional] [default to undefined] |
| **name**           | **string**                                                                     | Názov alebo meno.                                                                                                                                                                                                                                                                                 | [optional] [default to undefined] |
| **suffix**         | **string**                                                                     | Sufix.                                                                                                                                                                                                                                                                                            | [optional] [default to undefined] |
| **various_ids**    | [**Array&lt;UpvsIdentityVariousIdsInner&gt;**](UpvsIdentityVariousIdsInner.md) | Rôzne identifikátory.                                                                                                                                                                                                                                                                             | [optional] [default to undefined] |
| **upvs**           | [**UpvsIdentityUpvs**](UpvsIdentityUpvs.md)                                    |                                                                                                                                                                                                                                                                                                   | [optional] [default to undefined] |
| **addresses**      | [**Array&lt;UpvsIdentityAddressesInner&gt;**](UpvsIdentityAddressesInner.md)   | Fyzické adresy.                                                                                                                                                                                                                                                                                   | [optional] [default to undefined] |
| **emails**         | [**Array&lt;UpvsIdentityEmailsInner&gt;**](UpvsIdentityEmailsInner.md)         | E-mailové adresy.                                                                                                                                                                                                                                                                                 | [optional] [default to undefined] |
| **phones**         | [**Array&lt;UpvsIdentityPhonesInner&gt;**](UpvsIdentityPhonesInner.md)         | Telefónne čísla.                                                                                                                                                                                                                                                                                  | [optional] [default to undefined] |

## Example

```typescript
import { UpvsNaturalPerson } from './api'

const instance: UpvsNaturalPerson = {
  natural_person,
  ids,
  uri,
  en,
  type,
  status,
  name,
  suffix,
  various_ids,
  upvs,
  addresses,
  emails,
  phones,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
