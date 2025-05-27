# ManamentAutentifikanchCertifiktovAdministrciaApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                        | HTTP request                                 | Description                    |
| ----------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| [**administrationCertificatesIdDelete**](#administrationcertificatesiddelete) | **DELETE** /administration/certificates/{id} | Zmaže certifikát               |
| [**administrationCertificatesIdGet**](#administrationcertificatesidget)       | **GET** /administration/certificates/{id}    | Vráti informácie o certifikáte |
| [**administrationCertificatesPost**](#administrationcertificatespost)         | **POST** /administration/certificates        | Vygeneruje nový certifikát     |

# **administrationCertificatesIdDelete**

> administrationCertificatesIdDelete()

### Example

```typescript
import { ManamentAutentifikanchCertifiktovAdministrciaApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManamentAutentifikanchCertifiktovAdministrciaApi(configuration)

let id: string //Identifikátor certifikátu. (default to undefined)

const { status, data } = await apiInstance.administrationCertificatesIdDelete(id)
```

### Parameters

| Name   | Type         | Description                | Notes                 |
| ------ | ------------ | -------------------------- | --------------------- |
| **id** | [**string**] | Identifikátor certifikátu. | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[Administration Token](../README.md#Administration Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **204**     | Certifikát bol úspešne zmazaný. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **administrationCertificatesIdGet**

> AdministrationCertificatesIdGet200Response administrationCertificatesIdGet()

### Example

```typescript
import { ManamentAutentifikanchCertifiktovAdministrciaApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManamentAutentifikanchCertifiktovAdministrciaApi(configuration)

let id: string //Identifikátor certifikátu. (default to undefined)

const { status, data } = await apiInstance.administrationCertificatesIdGet(id)
```

### Parameters

| Name   | Type         | Description                | Notes                 |
| ------ | ------------ | -------------------------- | --------------------- |
| **id** | [**string**] | Identifikátor certifikátu. | defaults to undefined |

### Return type

**AdministrationCertificatesIdGet200Response**

### Authorization

[Administration Token](../README.md#Administration Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                    | Response headers |
| ----------- | ---------------------------------------------- | ---------------- |
| **200**     | Informácie o certifikáte boli úspešne vrátené. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **administrationCertificatesPost**

> administrationCertificatesPost(administrationCertificatesPostRequest)

### Example

```typescript
import {
  ManamentAutentifikanchCertifiktovAdministrciaApi,
  Configuration,
  AdministrationCertificatesPostRequest,
} from './api'

const configuration = new Configuration()
const apiInstance = new ManamentAutentifikanchCertifiktovAdministrciaApi(configuration)

let administrationCertificatesPostRequest: AdministrationCertificatesPostRequest //

const { status, data } = await apiInstance.administrationCertificatesPost(
  administrationCertificatesPostRequest,
)
```

### Parameters

| Name                                      | Type                                      | Description | Notes |
| ----------------------------------------- | ----------------------------------------- | ----------- | ----- |
| **administrationCertificatesPostRequest** | **AdministrationCertificatesPostRequest** |             |       |

### Return type

void (empty response body)

### Authorization

[Administration Token](../README.md#Administration Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                          | Response headers |
| ----------- | ------------------------------------ | ---------------- |
| **201**     | Certifikát bol úspešne vygenerovaný. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
