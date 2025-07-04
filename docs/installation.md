# Installation Guide

## Prerequisites

- Python 3.8 or higher
- OpenAI API key
- (Optional) Azure AD app registration for authentication

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd embedded-chatbot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   AZURE_TENANT_ID=your_tenant_id_here
   AZURE_API_CLIENT_ID=your_client_id_here
   ```

4. **Prepare your documents**
   Place your Markdown files in the `docs/` directory.

5. **Build the knowledge base**
   ```bash
   python backend/ingest.py
   ```

6. **Start the server**
   ```bash
   uvicorn backend.app:app --host 0.0.0.0 --port 8000
   ```

## Testing

You can test the installation using the Streamlit interface:
```bash
streamlit run backend/app.py
```

## WordPress Integration

To integrate with WordPress:

1. Copy the plugin files from `wordpress/wp-content/plugins/my-chat-embed/` to your WordPress plugins directory
2. Activate the plugin in the WordPress admin panel
3. Configure the API endpoint URL in the plugin settings
