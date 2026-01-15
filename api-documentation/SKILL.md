---
name: api-documentation
description: Generate comprehensive API documentation including endpoint specs, request/response examples, and OpenAPI schemas. Use when the user needs API docs, endpoint documentation, swagger/OpenAPI specs, or developer documentation for APIs. Triggers include "document this API", "API documentation", "endpoint docs", "swagger", "OpenAPI", "REST API docs", "API reference".
---

# API Documentation

## Core Principles

1. **Example-driven**: Every endpoint needs request/response examples
2. **Copy-pasteable**: Code samples that work immediately
3. **Error-first**: Document what can go wrong
4. **Consistent**: Same structure for every endpoint

## Documentation Structure

### Endpoint Template

```markdown
## [HTTP Method] [Path]

[One-line description of what this endpoint does]

### Authentication
[Required auth method: Bearer token, API key, etc.]

### Request

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | [Description] |

**Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | [Description] |

**Request Body**
```json
{
  "field": "value",
  "nested": {
    "field": "value"
  }
}
```

**Body Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field` | string | Yes | [Description] |

### Response

**Success (200 OK)**
```json
{
  "id": "abc123",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {}
}
```

**Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | `invalid_request` | [When this happens] |
| 401 | `unauthorized` | [When this happens] |
| 404 | `not_found` | [When this happens] |

### Example

**cURL**
```bash
curl -X POST https://api.example.com/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```
```

## OpenAPI Spec Template

```yaml
openapi: 3.0.3
info:
  title: [API Name]
  version: 1.0.0
  description: [API description]

servers:
  - url: https://api.example.com/v1
    description: Production

paths:
  /resource:
    get:
      summary: List resources
      operationId: listResources
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResourceList'

components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
      required:
        - id
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## README Template

```markdown
# [API Name] API

[One paragraph: what this API does]

## Quick Start

1. Get your API key from [location]
2. Make your first request:

```bash
curl https://api.example.com/v1/resource \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Authentication

All requests require a Bearer token in the Authorization header.

## Base URL

Production: `https://api.example.com/v1`

## Rate Limits

- 100 requests/minute per API key
- 429 response when exceeded

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /resources | List all resources |
| POST | /resources | Create resource |
| GET | /resources/:id | Get single resource |

## Error Handling

All errors return JSON with `error` and `message` fields.
```

## Quality Checks

- [ ] Every endpoint has working example
- [ ] All parameters documented with types
- [ ] Error responses documented
- [ ] Authentication requirements clear
- [ ] Code samples are copy-pasteable
- [ ] Response schema matches example
