# AuthApi

All URIs are relative to _http://localhost:3000_

| Method                                          | HTTP request       | Description                 |
| ----------------------------------------------- | ------------------ | --------------------------- |
| [**authControllerLogin**](#authcontrollerlogin) | **GET** /auth/user | Check if user is authorized |

# **authControllerLogin**

> CognitoGetUserData authControllerLogin()

### Example

```typescript
import { AuthApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new AuthApi(configuration)

const { status, data } = await apiInstance.authControllerLogin()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**CognitoGetUserData**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Return data from cognito | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
