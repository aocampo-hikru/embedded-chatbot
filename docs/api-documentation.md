# API Documentation

## TechCorp Solutions REST API v2.1

The TechCorp Solutions API allows you to programmatically access and manipulate your data, dashboards, and reports.

## Authentication

All API requests require authentication using API keys. You can generate API keys from your account dashboard.

### API Key Authentication
```http
GET /api/v2/dashboards
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Rate Limits
- **Professional Plan**: 1,000 requests per hour
- **Enterprise Plan**: 10,000 requests per hour
- **Enterprise Plus**: 100,000 requests per hour

## Base URL
```
https://api.techcorp-solutions.com/v2
```

## Core Endpoints

### Dashboards

#### List Dashboards
```http
GET /api/v2/dashboards
```

**Response:**
```json
{
  "dashboards": [
    {
      "id": "dash_123",
      "name": "Sales Performance",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-07-01T14:22:00Z",
      "widgets": 12
    }
  ],
  "total": 25,
  "page": 1
}
```

#### Create Dashboard
```http
POST /api/v2/dashboards
Content-Type: application/json

{
  "name": "My Dashboard",
  "description": "Dashboard description",
  "public": false
}
```

### Data Sources

#### List Data Sources
```http
GET /api/v2/datasources
```

#### Connect New Data Source
```http
POST /api/v2/datasources
Content-Type: application/json

{
  "type": "postgresql",
  "name": "Production DB",
  "connection": {
    "host": "db.example.com",
    "port": 5432,
    "database": "production",
    "username": "readonly_user",
    "ssl": true
  }
}
```

### Reports

#### Generate Report
```http
POST /api/v2/reports/generate
Content-Type: application/json

{
  "dashboard_id": "dash_123",
  "format": "pdf",
  "filters": {
    "date_range": "last_30_days",
    "region": "north_america"
  }
}
```

#### Schedule Report
```http
POST /api/v2/reports/schedule
Content-Type: application/json

{
  "dashboard_id": "dash_123",
  "schedule": "weekly",
  "format": "excel",
  "recipients": ["manager@company.com"],
  "day_of_week": "monday"
}
```

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'dashboard_id' parameter is required",
    "details": {
      "parameter": "dashboard_id",
      "expected": "string"
    }
  }
}
```

## SDKs and Libraries

### Official SDKs
- **Python**: `pip install techcorp-api`
- **JavaScript/Node.js**: `npm install @techcorp/api-client`
- **Java**: Maven/Gradle dependency available
- **C#/.NET**: NuGet package available

### Example Usage (Python)
```python
from techcorp_api import TechCorpClient

client = TechCorpClient(api_key='your_api_key')

# List dashboards
dashboards = client.dashboards.list()

# Create new dashboard
new_dashboard = client.dashboards.create({
    'name': 'Sales Analysis',
    'description': 'Q4 sales performance dashboard'
})

# Generate report
report = client.reports.generate(
    dashboard_id='dash_123',
    format='pdf'
)
```

## Webhooks

Configure webhooks to receive real-time notifications about events in your account.

### Supported Events
- `dashboard.created`
- `dashboard.updated` 
- `report.generated`
- `alert.triggered`
- `user.login`

### Webhook Configuration
```http
POST /api/v2/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["dashboard.created", "report.generated"],
  "secret": "your_webhook_secret"
}
```
