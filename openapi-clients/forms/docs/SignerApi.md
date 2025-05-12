# SignerApi

All URIs are relative to _http://localhost:3000_

| Method                                                              | HTTP request                     | Description     |
| ------------------------------------------------------------------- | -------------------------------- | --------------- |
| [**signerControllerGetSignerData**](#signercontrollergetsignerdata) | **POST** /signer/get-signer-data | Get signer data |

# **signerControllerGetSignerData**

> SignerDataResponseDto signerControllerGetSignerData(signerDataRequestDto)

Generates signer data including XML and metadata for form signing

### Example

```typescript
import { SignerApi, Configuration, SignerDataRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new SignerApi(configuration)

let signerDataRequestDto: SignerDataRequestDto //

const { status, data } = await apiInstance.signerControllerGetSignerData(signerDataRequestDto)
```

### Parameters

| Name                     | Type                     | Description | Notes |
| ------------------------ | ------------------------ | ----------- | ----- |
| **signerDataRequestDto** | **SignerDataRequestDto** |             |       |

### Return type

**SignerDataResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description        | Response headers |
| ----------- | ------------------ | ---------------- |
| **200**     | Return signer data | -                |
| **201**     |                    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
