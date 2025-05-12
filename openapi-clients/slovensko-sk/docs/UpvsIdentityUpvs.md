# UpvsIdentityUpvs

ÚPVS atribúty.

## Properties

| Name                            | Type        | Description                                                                                                                                                                                                                                                                                                                                                                                                                        | Notes                             |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **edesk_number**                | **string**  | Číslo eDesk schránky.                                                                                                                                                                                                                                                                                                                                                                                                              | [optional] [default to undefined] |
| **edesk_status**                | **string**  | Stav eDesk schránky: - &#x60;nonexistent&#x60; neexistujúca schránka, - &#x60;created&#x60; vytvorená schránka (okrem prijímania správ), - &#x60;active&#x60; aktivovaná schránka (okrem prijímania doručeniek), - &#x60;deliverable&#x60; aktivovaná schránka na doručovanie (vrátane prijímania doručeniek), - &#x60;disabled&#x60; deaktivovaná schránka (okrem prijímania doručeniek), - &#x60;deleted&#x60; zrušená schránka. | [optional] [default to undefined] |
| **edesk_remote_uri**            | **string**  | URI adresa vzdialenej eDesk schránky.                                                                                                                                                                                                                                                                                                                                                                                              | [optional] [default to undefined] |
| **edesk_cuet_delivery_enabled** | **boolean** | Indikátor či do eDesk schránky budú doručované CUET správy.                                                                                                                                                                                                                                                                                                                                                                        | [optional] [default to undefined] |
| **edesk_delivery_limited**      | **boolean** | Indikátor či je doručovanie do eDesk schránky obmedzené.                                                                                                                                                                                                                                                                                                                                                                           | [optional] [default to undefined] |
| **enotify_preferred_channel**   | **string**  | Preferovaný kanál prijímania správ.                                                                                                                                                                                                                                                                                                                                                                                                | [optional] [default to undefined] |
| **enotify_preferred_calendar**  | **string**  | Preferovaný kalendár odosielania správ.                                                                                                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined] |
| **enotify_emergency_allowed**   | **boolean** | Indikátor či je odosielanie núdzových správ povolené.                                                                                                                                                                                                                                                                                                                                                                              | [optional] [default to undefined] |
| **enotify_email_allowed**       | **boolean** | Indikátor či je odosielanie e-mailov povolené.                                                                                                                                                                                                                                                                                                                                                                                     | [optional] [default to undefined] |
| **enotify_sms_allowed**         | **boolean** | Indikátor či je odosielanie SMS povolené.                                                                                                                                                                                                                                                                                                                                                                                          | [optional] [default to undefined] |
| **preferred_language**          | **string**  | Preferovaný jazyk.                                                                                                                                                                                                                                                                                                                                                                                                                 | [optional] [default to undefined] |
| **re_iam_identity_id**          | **string**  | Identifikátor v pôvodnom RE IAM.                                                                                                                                                                                                                                                                                                                                                                                                   | [optional] [default to undefined] |

## Example

```typescript
import { UpvsIdentityUpvs } from './api'

const instance: UpvsIdentityUpvs = {
  edesk_number,
  edesk_status,
  edesk_remote_uri,
  edesk_cuet_delivery_enabled,
  edesk_delivery_limited,
  enotify_preferred_channel,
  enotify_preferred_calendar,
  enotify_emergency_allowed,
  enotify_email_allowed,
  enotify_sms_allowed,
  preferred_language,
  re_iam_identity_id,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
