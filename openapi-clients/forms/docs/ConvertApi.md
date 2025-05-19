# ConvertApi

All URIs are relative to _http://localhost:3000_

| Method                                                                          | HTTP request                     | Description         |
| ------------------------------------------------------------------------------- | -------------------------------- | ------------------- |
| [**convertControllerConvertJsonToXmlV2**](#convertcontrollerconvertjsontoxmlv2) | **POST** /convert/json-to-xml-v2 | Convert JSON to XML |
| [**convertControllerConvertToPdf**](#convertcontrollerconverttopdf)             | **POST** /convert/pdf            |                     |
| [**convertControllerConvertXmlToJson**](#convertcontrollerconvertxmltojson)     | **POST** /convert/xml-to-json    | Convert XML to JSON |

# **convertControllerConvertJsonToXmlV2**

> string convertControllerConvertJsonToXmlV2(jsonToXmlV2RequestDto)

Generates XML form from given JSON data or form data stored in the database. If jsonData is not provided, the form data from the database will be used.

### Example

```typescript
import { ConvertApi, Configuration, JsonToXmlV2RequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new ConvertApi(configuration)

let jsonToXmlV2RequestDto: JsonToXmlV2RequestDto //

const { status, data } =
  await apiInstance.convertControllerConvertJsonToXmlV2(jsonToXmlV2RequestDto)
```

### Parameters

| Name                      | Type                      | Description | Notes |
| ------------------------- | ------------------------- | ----------- | ----- |
| **jsonToXmlV2RequestDto** | **JsonToXmlV2RequestDto** |             |       |

### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description     | Response headers |
| ----------- | --------------- | ---------------- |
| **200**     | Return XML form | -                |
| **201**     |                 | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **convertControllerConvertToPdf**

> object convertControllerConvertToPdf(convertToPdfRequestDto)

Generates PDF for given form data.

### Example

```typescript
import { ConvertApi, Configuration, ConvertToPdfRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new ConvertApi(configuration)

let convertToPdfRequestDto: ConvertToPdfRequestDto //

const { status, data } = await apiInstance.convertControllerConvertToPdf(convertToPdfRequestDto)
```

### Parameters

| Name                       | Type                       | Description | Notes |
| -------------------------- | -------------------------- | ----------- | ----- |
| **convertToPdfRequestDto** | **ConvertToPdfRequestDto** |             |       |

### Return type

**object**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description             | Response headers |
| ----------- | ----------------------- | ---------------- |
| **200**     | Return pdf file stream. | -                |
| **201**     |                         | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **convertControllerConvertXmlToJson**

> XmlToJsonResponseDto convertControllerConvertXmlToJson(xmlToJsonRequestDto)

Generates JSON form from given XML data and form ID

### Example

```typescript
import { ConvertApi, Configuration, XmlToJsonRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new ConvertApi(configuration)

let xmlToJsonRequestDto: XmlToJsonRequestDto //

const { status, data } = await apiInstance.convertControllerConvertXmlToJson(xmlToJsonRequestDto)
```

### Parameters

| Name                    | Type                    | Description | Notes |
| ----------------------- | ----------------------- | ----------- | ----- |
| **xmlToJsonRequestDto** | **XmlToJsonRequestDto** |             |       |

### Return type

**XmlToJsonResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description      | Response headers |
| ----------- | ---------------- | ---------------- |
| **200**     | Return Json form | -                |
| **201**     |                  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
