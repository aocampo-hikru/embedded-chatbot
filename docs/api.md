# API Documentation

## Chat Endpoint

**POST** `/chat`

### Request Format

```json
{
  "query": "Your question here"
}
```

### Response Format

```json
{
  "answer": "The chatbot's response based on the knowledge base"
}
```

### Authentication

Requests must include a valid Azure AD Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

The token must include the `chat.access` scope.

### Example Usage

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"query": "How does the chatbot work?"}'
```

## Error Responses

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Token lacks required scope
- **422 Unprocessable Entity**: Invalid request format
