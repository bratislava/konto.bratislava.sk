# FormsV2Api

All URIs are relative to _http://localhost:3000_

| Method                                                          | HTTP request       | Description |
| --------------------------------------------------------------- | ------------------ | ----------- |
| [**formsV2ControllerCreateForm**](#formsv2controllercreateform) | **POST** /forms-v2 |             |

# **formsV2ControllerCreateForm**

> CreateFormOutput formsV2ControllerCreateForm(createFormInput)

### Example

```typescript
import { FormsV2Api, Configuration, CreateFormInput } from './api'

const configuration = new Configuration()
const apiInstance = new FormsV2Api(configuration)

let createFormInput: CreateFormInput //

const { status, data } = await apiInstance.formsV2ControllerCreateForm(createFormInput)
```

### Parameters

| Name                | Type                | Description | Notes |
| ------------------- | ------------------- | ----------- | ----- |
| **createFormInput** | **CreateFormInput** |             |       |

### Return type

**CreateFormOutput**

### Authorization

[cognitoGuestIdentityId](../README.md#cognitoGuestIdentityId), [bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
