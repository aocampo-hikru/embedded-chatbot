# Frequently Asked Questions (FAQ)

## Installation and Setup

### How do I install the embedded chatbot?
To install the embedded chatbot system:

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key
   - Configure Azure AD credentials (optional)

3. **Ingest Documentation**
   ```bash
   python -m backend.ingest
   ```

4. **Start the Backend**
   ```bash
   uvicorn backend.app:app --reload
   ```

5. **Access the Demo**
   Open: http://localhost:8000/demos/index.html

### What are the API endpoints available for integration?
The chatbot provides several API endpoints:

- **`POST /chat-demo`** - Public chat endpoint (no authentication required)
- **`POST /chat`** - Secure chat endpoint (requires Azure AD authentication)
- **`GET /demos/`** - Serves demo pages and static files
- **`GET /node_modules/`** - Serves JavaScript dependencies

### How do I integrate with WordPress?
WordPress integration is straightforward:

1. **Upload Files**: Copy `my-chat.js` to your WordPress theme directory
2. **Enqueue Script**: Add to your `functions.php`:
   ```php
   function enqueue_chat_widget() {
       wp_enqueue_script('my-chat-widget', '/path/to/my-chat.js', array(), '1.0.0', true);
   }
   add_action('wp_enqueue_scripts', 'enqueue_chat_widget');
   ```

3. **Add Shortcode**: Create a shortcode for easy embedding:
   ```php
   function my_chat_shortcode() {
       return '<my-chat-widget></my-chat-widget>';
   }
   add_shortcode('my_chat', 'my_chat_shortcode');
   ```

4. **Use in Content**: Add `[my_chat]` to any post or page

### What authentication options are supported?
The system supports flexible authentication:

- **Guest Mode**: Full functionality without login
- **Azure AD**: Enterprise-grade authentication
- **Demo Mode**: Simulated authentication for testing
- **Multi-Factor Authentication**: Enhanced security for production

### What are the key features of this chatbot?
Key features include:

- **Retrieval-Augmented Generation (RAG)**: Answers based on your documentation
- **Dual Access Levels**: Public and secure content separation
- **Modern UI**: LitElement-based responsive design
- **Easy Integration**: Works with WordPress, static sites, and SPAs
- **Scalable Backend**: FastAPI with ChromaDB vector storage
- **Cross-Origin Support**: CORS-enabled for web integration

## Technical Configuration

### How can I customize the chat widget appearance?
The chat widget uses CSS-in-JS for styling. You can customize it by:

1. **Modify the Widget**: Edit `my-chat.js` and update the `static styles` CSS
2. **Override Styles**: Add custom CSS to your page:
   ```css
   my-chat-widget {
       --primary-color: #your-color;
       --background-color: #your-bg;
   }
   ```

3. **Configuration Options**: Set widget options via `MY_CHAT_CONFIG`:
   ```javascript
   window.MY_CHAT_CONFIG = {
       apiBase: 'your-api-url',
       clientId: 'your-client-id',
       tenantId: 'your-tenant-id'
   };
   ```

### What programming languages are supported?
The system is built with:

- **Backend**: Python (FastAPI, LangChain, OpenAI)
- **Frontend**: JavaScript (LitElement, ES6 modules)
- **Database**: ChromaDB for vector storage
- **Authentication**: MSAL.js for Azure AD integration
- **Documentation**: Markdown files for knowledge base

### How do I set up WordPress integration?
For complete WordPress integration:

1. **Theme Integration**: Add the widget to your theme templates
2. **Plugin Development**: Create a custom plugin for advanced features
3. **Shortcode Usage**: Use `[my_chat]` in content areas
4. **Admin Panel**: Configure settings through WordPress admin
5. **Multisite Support**: Compatible with WordPress multisite installations

## Troubleshooting

### Why am I getting CORS errors?
CORS errors typically occur when:

- **File Protocol**: Opening HTML files directly (use `http://localhost:8000` instead)
- **Wrong URL**: Access via the FastAPI server, not file system
- **Missing Headers**: Ensure CORS is properly configured in the backend

### How do I resolve module loading issues?
Module loading problems can be fixed by:

- **MIME Types**: Ensure server sends correct `application/javascript` headers
- **ES6 Support**: Use modern browsers that support ES6 modules
- **CDN Access**: Verify internet connection for CDN-hosted dependencies

### What if authentication isn't working?
Authentication issues are often due to:

- **Azure AD Configuration**: Verify client ID and tenant ID are correct
- **Redirect URIs**: Ensure redirect URIs match in Azure AD portal
- **Demo Mode**: The system falls back to demo authentication if Azure AD fails

## Performance and Scaling

### How many concurrent users can the system handle?
The system is designed for scalability:

- **FastAPI Backend**: Handles 1000+ requests/second
- **Vector Database**: ChromaDB optimized for retrieval performance
- **Caching**: Implements response caching for frequently asked questions
- **Load Balancing**: Can be deployed behind load balancers for high availability

### How do I optimize response times?
To improve performance:

- **Document Chunking**: Optimize chunk size (default 500 characters)
- **Embedding Cache**: Implement caching for common queries
- **Database Indexing**: Ensure proper vector indexing
- **CDN Usage**: Use CDN for static assets

### Can I deploy this in production?
Yes, the system is production-ready:

- **Security**: Azure AD integration and secure endpoints
- **Monitoring**: Built-in logging and error handling
- **Scalability**: Horizontal scaling support
- **Backup**: Automated backup procedures for vector databases

## Advanced Usage

### How do I add custom knowledge sources?
To extend the knowledge base:

1. **Add Documents**: Place Markdown files in the `docs/` directory
2. **Reingest**: Run `python -m backend.ingest` to update the vector store
3. **Secure Content**: Use `docs-secure/` for authenticated-only content
4. **Custom Loaders**: Implement custom document loaders for other formats

### Can I integrate with other LLM providers?
The system supports multiple LLM providers:

- **OpenAI**: Default provider (GPT-4, GPT-3.5)
- **Azure OpenAI**: Enterprise deployment option
- **Local Models**: Compatible with local LLM deployments
- **Custom Providers**: Implement custom LLM integrations via LangChain

### How do I implement custom authentication?
For custom authentication:

1. **Backend Integration**: Modify the authentication middleware
2. **Token Validation**: Implement custom token validation logic
3. **User Context**: Pass user information to the chat endpoints
4. **Access Control**: Implement role-based access control (RBAC)
