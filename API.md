# Nigeria Pulse Public REST API Documentation

The Nigeria Pulse API allows external applications to securely fetch aggregated, anonymized pulse data for research and analytics. This API is designed to support government transparency initiatives and civic-tech research.

## Base URL
`https://[APP_URL]/api/v1`

## Authentication
All requests to the public REST API must include a valid API key in the `X-Pulse-API-Key` header. Requests without a valid key will receive a `401 Unauthorized` or `403 Forbidden` response.

*   **Public (Read-Only)**: Requests to aggregated pulse data require an active API key.
*   **Admin**: Key generation and system-level operations are restricted.

### Obtaining a Key
System administrators can generate API keys by using the admin utility endpoint (internal) or via the **Admin Dashboard** (if implemented). 

Generation Endpoint (Internal Admin): `POST /api/v1/admin/keys`
Requires `secret` and `ownerEmail` in the request body.

## Endpoints

### 1. List Active Pulses
Returns metadata for all pulse questions that are currently live.

**Endpoint:** `GET /pulse`

**Request:**
*   **Headers**: 
    *   `Accept: application/json`
    *   `X-Pulse-API-Key: YOUR_API_KEY` (Required)

**Success Response (200 OK):**
```json
{
  "surveys": [
    {
      "id": "CW20-2026",
      "question": "How do you rate electricity supply this week?",
      "options": ["Excellent", "Good", "Fair", "Poor"],
      "totalVotes": 124500,
      "weekLabel": "Week 20, 2026"
    }
  ]
}
```

**Field Descriptions:**
*   `id`: Unique identifier for the survey (typically formatted by year/week).
*   `question`: The primary question text in English.
*   `options`: An array of available choices for the audience.
*   `totalVotes`: The current cross-platform vote count.
*   `weekLabel`: Descriptive label for the reporting period.

---

### 2. Get Aggregated Results
Returns the numerical breakdown of votes for a specific survey. No individual voter data is shared.

**Endpoint:** `GET /pulse/:surveyId/results`

**Request:**
*   **Path Parameters**: `surveyId` (Required) - The unique ID of the survey.

**Success Response (200 OK):**
```json
{
  "surveyId": "CW20-2026",
  "results": {
    "0": 12000,
    "1": 45000,
    "2": 32000,
    "3": 35500
  },
  "totalVotes": 124500,
  "trend": "rising"
}
```

**Field Descriptions:**
*   `results`: A map where keys are the indices of the `options` array from the survey metadata, and values are the vote counts.
*   `trend`: A sentiment directional indicator based on velocity (`rising`, `falling`, `stable`).

**Error Responses:**
*   `404 Not Found`: The requested `surveyId` does not exist.
*   `500 Internal Error`: Something went wrong on our side.

## Security & Privacy
*   **Anonymity**: The API strictly serves aggregated data. No Personally Identifiable Information (PII) such as emails, names, or device IDs is stored in a way that is accessible via these endpoints.
*   **Rate Limiting**: Public endpoints are rate-limited to 100 requests per hour per IP address to ensure service stability.

## Example Usage (cURL)
```bash
curl -X GET https://[APP_URL]/api/v1/pulse \
     -H "Accept: application/json" \
     -H "X-Pulse-API-Key: YOUR_API_KEY"
```
