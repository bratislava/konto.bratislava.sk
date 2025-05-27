# InformcieOPrihlsenomPouvateoviApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                          | HTTP request                | Description                                            |
| ----------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| [**apiUpvsAssertionGet**](#apiupvsassertionget) | **GET** /api/upvs/assertion | Vráti bezpečnostné informácie prihláseného používateľa |
| [**apiUpvsIdentityGet**](#apiupvsidentityget)   | **GET** /api/upvs/identity  | Vráti identitu prihláseného používateľa                |

# **apiUpvsAssertionGet**

> string apiUpvsAssertionGet()

Vráti bezpečnostné informácie prihláseného používateľa.

### Example

```typescript
import { InformcieOPrihlsenomPouvateoviApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new InformcieOPrihlsenomPouvateoviApi(configuration)

let accept: string // (default to undefined)

const { status, data } = await apiInstance.apiUpvsAssertionGet(accept)
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **accept** | [**string**] |             | defaults to undefined |

### Return type

**string**

### Authorization

[API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/samlassertion+xml

### HTTP response details

| Status code | Description                                                       | Response headers |
| ----------- | ----------------------------------------------------------------- | ---------------- |
| **200**     | Úspešne vrátené bezpečnostné informácie prihláseného používateľa. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiUpvsIdentityGet**

> UpvsNaturalPerson apiUpvsIdentityGet()

Vráti identitu prihláseného používateľa. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import { InformcieOPrihlsenomPouvateoviApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new InformcieOPrihlsenomPouvateoviApi(configuration)

const { status, data } = await apiInstance.apiUpvsIdentityGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**UpvsNaturalPerson**

### Authorization

[API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Úspešne vrátená identita prihláseného používateľa. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
