# ZasielaniePodanAdministrciaApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                      | HTTP request                              | Description                      |
| --------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| [**administrationEformSynchronizeGet**](#administrationeformsynchronizeget) | **GET** /administration/eform/synchronize | Spustí synchronizáciu formulárov |

# **administrationEformSynchronizeGet**

> administrationEformSynchronizeGet()

Spustí manuálnu aktualizáciu lokálneho úložiska všetkých formulárov. Za normálnych okolností sa spúšťa automaticky a nie je ho potrebné spúštať manuálne.

### Example

```typescript
import { ZasielaniePodanAdministrciaApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanAdministrciaApi(configuration)

const { status, data } = await apiInstance.administrationEformSynchronizeGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

[Administration Token](../README.md#Administration Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                      | Response headers |
| ----------- | ------------------------------------------------ | ---------------- |
| **204**     | Synchronizácia formulárov bola úspešne spustená. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
