# My Chat Widget

This folder contains `my-chat.js`, a Lit-based WebComponent that authenticates users with Microsoft Entra ID using MSAL.js and communicates with the backend chatbot API.

## Azure App Registration
1. Create an **API** app registration:
   - Expose an API scope `chat.access`.
   - Note the *Application (client) ID* and set it as `AZURE_API_CLIENT_ID`.
2. Create an **SPA** app registration for the frontend:
   - Add a redirect URI `http://localhost` (or your domain).
   - In **API permissions** add the `chat.access` scope from the API app.
   - Note the SPA client ID and tenant ID for use in `MY_CHAT_CONFIG`.

## WordPress Integration
Copy the plugin and theme from `wordpress/` into your existing WordPress installation:

1. `wp-content/plugins/my-chat-embed/`
2. `wp-content/themes/chat-demo/`

Activate both via the WordPress admin panel. Define the API base URL in `wp-config.php`:

```php
define('MY_CHAT_API_BASE', 'https://your-backend-host');
```

Once activated, visit `/chat/` on your site to see the embedded `<my-chat>` widget.
