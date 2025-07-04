/**
 * My Chat Widget – Guest + Azure AD (Auth Code PKCE)
 * --------------------------------------------------
 * Updated to use @azure/msal-browser (v3) instead of the legacy msal.js v1.
 * Flow:
 *   1) Guests can ask questions immediately (public endpoint).
 *   2) Click    }
  }

  simulateLogin() {gers Azure AD loginPopup.
 *   3) After sign‑in we call acquireTokenSilent to fetch an access token
 *      for the protected API scope (fallback to acquireTokenPopup on consent).
 *   4) Token is attached as Bearer header to /chat endpoint.
 *
 *   CONFIG → window.CHAT_CONFIG = {
 *    apiBase   : 'https://api.example.com',
 *    clientId  : '<APP_ID>',
 *    tenantId  : '<TENANT_ID>',
 *    scope     : 'api://<APP_ID>/.default'   // or any custom scope
 *  };
 */

import { LitElement, html, css } from 'https://unpkg.com/lit@2/index.js?module';

// Load MSAL for Azure AD authentication
let PublicClientApplication = null;
let LogLevel = null;

// Load MSAL via script tag for better browser compatibility
const msalScript = document.createElement('script');
msalScript.src = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@4.14.0/lib/msal-browser.min.js';
msalScript.onload = () => {
  if (window.msal) {
    PublicClientApplication = window.msal.PublicClientApplication;
    LogLevel = window.msal.LogLevel;
    console.log('MSAL loaded successfully');
    // Trigger initialization for any existing chat widgets
    window.dispatchEvent(new CustomEvent('msalLoaded'));
  }
};
msalScript.onerror = () => {
  console.warn('MSAL failed to load from primary CDN, trying fallback...');
  // Try fallback CDN
  const fallbackScript = document.createElement('script');
  fallbackScript.src = 'https://alcdn.msauth.net/browser/4.14.0/js/msal-browser.min.js';
  fallbackScript.onload = () => {
    if (window.msal) {
      PublicClientApplication = window.msal.PublicClientApplication;
      LogLevel = window.msal.LogLevel;
      console.log('MSAL loaded successfully from fallback CDN');
      // Trigger initialization for any existing chat widgets
      window.dispatchEvent(new CustomEvent('msalLoaded'));
    }
  };
  fallbackScript.onerror = () => {
    console.warn('MSAL failed to load from all sources. Authentication will use demo mode.');
    window.dispatchEvent(new CustomEvent('msalFailed'));
  };
  document.head.appendChild(fallbackScript);
};
document.head.appendChild(msalScript);

export class MyChatWidget extends LitElement {
  /* ---------------------- reactive props ---------------------- */
  static properties = {
    messages: { state: true },
    token: { state: true },
    account: { state: true },
    isGuest: { state: true },
    msalReady: { state: true }
  };

  /* --------------------------- styles -------------------------- */
  static styles = css`
    :host {
      display: block;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      width: 100%;
      font-family: inherit;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    /* — trimmed for brevity; reuse previous CSS classes — */
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #e2e8f0}
    .status{font-size:0.875rem;color:#64748b;font-weight:500}
    .login-btn{background:#0057ff;color:#fff;border:none;border-radius:6px;padding:0.5rem 1rem;cursor:pointer;font-size:0.875rem;font-weight:500;transition:all .2s}
    .login-btn:hover{background:#003bb3;transform:translateY(-1px)}
    .login-btn.logout{background:#ef4444}.login-btn.logout:hover{background:#dc2626}
    .messages{max-height:300px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;margin-bottom:1rem;background:#f8fafc}
    .messages div{margin-bottom:12px;padding:0.75rem;border-radius:8px;line-height:1.5;font-size:0.875rem}
    .user-message{background:#0057ff;color:#fff;text-align:right;margin-left:3rem;border-radius:12px 12px 4px 12px}
    .assistant-message{background:#f1f5f9;border:1px solid #cbd5e1;color:#334155;margin-right:3rem;border-radius:12px 12px 12px 4px}
    .system-message{background:#fef3c7;border:1px solid #f59e0b;color:#92400e;text-align:center;font-style:italic;margin:0.5rem 0;border-radius:8px}
    input{width:100%;box-sizing:border-box;padding:0.75rem 1rem;border:1px solid #d1d5db;border-radius:8px;font-size:0.875rem;transition:border-color .2s}
    input:focus{outline:none;border-color:#0057ff;box-shadow:0 0 0 3px rgba(0,87,255,.1)}
    .loading{text-align:center;padding:2rem;color:#64748b;font-size:0.875rem}
  `;

  /* ------------------------- constructor ----------------------- */
  constructor() {
    super();
    const cfg = window.CHAT_CONFIG ?? {};

    this.apiBase = cfg.apiBase ?? 'http://localhost:8000';
    this.clientId = cfg.clientId ?? '';
    this.tenantId = cfg.tenantId ?? '';
    this.scope = cfg.scope ?? 'https://graph.microsoft.com/User.Read'; // Use Graph API as fallback

    // Debug logging
    console.log('🔧 Chat Widget Configuration:', {
      apiBase: this.apiBase,
      clientId: this.clientId ? `${this.clientId.substring(0, 8)}...` : 'MISSING',
      tenantId: this.tenantId ? `${this.tenantId.substring(0, 8)}...` : 'MISSING',
      scope: this.scope,
      msalAvailable: !!PublicClientApplication
    });

    this.messages = [
      {
        from: 'assistant',
        text: "Hello! I'm your AI assistant. Ask away as a guest or log in for secure features."
      }
    ];

    this.token = null;
    this.account = null;
    this.isGuest = true;
    this.msalReady = false;
    this.msal = null;

    // Initialize MSAL when library loads
    if (PublicClientApplication && LogLevel) {
      this.initializeMsal().catch(err => console.error('MSAL init error:', err));
    } else {
      // Wait for MSAL to load
      window.addEventListener('msalLoaded', () => {
        this.initializeMsal().catch(err => console.error('MSAL init error:', err));
      });
      window.addEventListener('msalFailed', () => {
        console.warn('MSAL initialization failed');
        this.msalReady = true;
        this.requestUpdate();
      });
    }
  }

  async initializeMsal() {
    if (!this.clientId || !this.tenantId || !PublicClientApplication || !LogLevel) {
      console.warn('MSAL configuration incomplete:', {
        clientId: !!this.clientId,
        tenantId: !!this.tenantId,
        PublicClientApplication: !!PublicClientApplication,
        LogLevel: !!LogLevel
      });
      this.msalReady = true;
      this.requestUpdate();
      return;
    }

    try {
      this.msal = new PublicClientApplication({
        auth: {
          clientId: this.clientId,
          authority: `https://login.microsoftonline.com/${this.tenantId}`,
          redirectUri: window.location.origin,
          postLogoutRedirectUri: window.location.origin,
          navigateToLoginRequestUrl: false
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false
        },
        system: {
          loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
              if (level <= LogLevel.Warning) {
                console.log('[MSAL]', message);
              }
            },
            logLevel: LogLevel.Warning,
            piiLoggingEnabled: false
          },
          allowNativeBroker: false // Disable native broker for web apps
        }
      });
      
      // CRITICAL: Initialize MSAL before any other operations
      await this.msal.initialize();
      console.log('✅ MSAL initialized successfully');
    } catch (err) {
      console.error('❌ MSAL initialization failed:', err);
      this.msal = null;
    }

    this.msalReady = true;
    this.requestUpdate();
  }

  /* --------------------------- render -------------------------- */
  render() {
    if (!this.msalReady) {
      return html`<div class="loading">🔄 Loading authentication system…</div>`;
    }

    // Show configuration status
    const configStatus = this.msal ? 
      '🔐 Azure AD Ready' : 
      '⚠️ Azure AD Not Configured';

    return html`
      <div class="header">
        <div class="status">
          ${this.isGuest
            ? html`👤 Guest Mode (endpoint: /chat) • ${configStatus}`
            : html`🔐 Authenticated (endpoint: /chat) ${this.account ? `— ${this.account.username}` : ''}`}
        </div>
        <button class="login-btn ${this.isGuest ? '' : 'logout'}" @click=${this.toggleAuth}>
          ${this.isGuest ? '🔐 Login' : '👤 Logout'}
        </button>
      </div>

      <div class="messages">
        ${this.messages.map(m => html`<div class="${m.from === 'user'
            ? 'user-message'
            : m.from === 'system'
            ? 'system-message'
            : 'assistant-message'}">${m.from === 'system' ? m.text : html`<b>${m.from}:</b> ${m.text}`}</div>`)}</div>
      <input placeholder="Ask me anything…" @keydown=${this.handleKey} />
    `;
  }

  /* --------------------------- auth --------------------------- */
  async toggleAuth() {
    this.isGuest ? await this.login() : this.logout();
  }

  async login() {
    if (!this.msal) {
      // Show detailed message about Azure AD configuration
      const configIssues = [];
      if (!this.clientId) configIssues.push('Client ID missing');
      if (!this.tenantId) configIssues.push('Tenant ID missing');
      if (!PublicClientApplication) configIssues.push('MSAL library not loaded');

      let message = '⚠️ Azure AD authentication unavailable. ';
      if (configIssues.length > 0) {
        message += `Issues: ${configIssues.join(', ')}. `;
      }
      message += 'Check the AZURE_AD_SETUP.md file for configuration instructions.';

      this.messages = [...this.messages, {
        from: 'system',
        text: message
      }];
      this.requestUpdate();
      return;
    }

    try {
      // Clear any existing messages about demo mode
      this.messages = this.messages.filter(m => !m.text.includes('demo mode') && !m.text.includes('CORS'));

      /* 1. First handle redirect if we came back from login */
      try {
        const handleRedirectResponse = await this.msal.handleRedirectPromise();
        if (handleRedirectResponse) {
          this.account = handleRedirectResponse.account;
          this.token = handleRedirectResponse.accessToken || handleRedirectResponse.idToken;
        }
      } catch (redirectError) {
        console.log('No redirect response:', redirectError.message);
      }

      /* 2. If no account from redirect, try popup login */
      if (!this.account) {
        this.messages = [...this.messages, {
          from: 'system',
          text: '🔄 Opening login popup...'
        }];
        this.requestUpdate();

        const loginRequest = {
          scopes: ['openid', 'profile', 'email'],
          prompt: 'select_account'
        };

        const loginResult = await this.msal.loginPopup(loginRequest);
        this.account = loginResult.account;
        this.token = loginResult.accessToken || loginResult.idToken;
        
        console.log('✅ Login successful:', this.account.username);
      }

      /* 3. Try to get access token for our API */
      if (this.account) {
        try {
          const silentRequest = { 
            account: this.account, 
            scopes: [this.scope],
            forceRefresh: false
          };
          const tokenResponse = await this.msal.acquireTokenSilent(silentRequest);
          this.token = tokenResponse.accessToken;
          console.log('✅ Got access token for API scope:', this.scope);
        } catch (silentError) {
          console.log('Silent token acquisition failed, trying popup:', silentError.message);
          try {
            const tokenResponse = await this.msal.acquireTokenPopup({
              account: this.account, 
              scopes: [this.scope]
            });
            this.token = tokenResponse.accessToken;
            console.log('✅ Got access token via popup for scope:', this.scope);
          } catch (popupError) {
            console.log('⚠️ Access token failed, using ID token:', popupError.message);
            // Keep the ID token we got from login
          }
        }
      }

      this.isGuest = false;
      this.messages = [...this.messages.filter(m => m.from !== 'system'), {
        from: 'system',
        text: `✅ Logged in as ${this.account.username}. You now have access to secure features.`
      }];
      this.requestUpdate();

    } catch (err) {
      console.error('❌ Login failed:', err);
      let errorMessage = 'Login failed. ';
      
      if (err.message.includes('popup_window_error') || err.message.includes('CORS')) {
        errorMessage += 'This may be due to popup blockers or CORS configuration. ';
      } else if (err.message.includes('interaction_required')) {
        errorMessage += 'User interaction is required. ';
      }
      
      errorMessage += `Error: ${err.message}`;
      
      this.messages = [...this.messages.filter(m => m.from !== 'system'), {
        from: 'system',
        text: errorMessage
      }];
      this.requestUpdate();
    }
  }

  simulateLogin() {
    this.token = 'demo-authenticated-token';
    this.isGuest = false;
    this.addSystemMessage('⚠️ Azure AD unavailable (CORS). Using demo mode - configure MSAL properly for production.');
  }

  logout() {
    // Clear local authentication state
    this.token = null;
    this.account = null;
    this.isGuest = true;

    // Optionally clear MSAL cache (without popup)
    if (this.msal) {
      try {
        // Clear the cache silently instead of using popup
        const accounts = this.msal.getAllAccounts();
        if (accounts.length > 0) {
          // Clear session storage cache
          this.msal.clearCache();
          console.log('✅ MSAL cache cleared');
        }
      } catch (error) {
        console.log('Cache clear warning:', error.message);
      }
    }

    this.addSystemMessage('👋 Logged out successfully. You\'re now in guest mode.');
    this.requestUpdate();
  }

  /* ------------------------- messaging ------------------------ */
  addSystemMessage(text) {
    this.messages = [...this.messages, { from: 'system', text }];
  }

  async handleKey(e) {
    if (e.key !== 'Enter' || !e.target.value.trim()) return;

    const text = e.target.value.trim();
    e.target.value = '';
    this.messages = [...this.messages, { from: 'user', text }];

    /* Determine endpoint & headers */
    const endpoint = this.isGuest ? '/chat' : '/chat-demo';
    const headers = { 'Content-Type': 'application/json' };
    if (!this.isGuest && this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const res = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        const data = await res.json();
        this.messages = [...this.messages, { from: 'assistant', text: data.response ?? '[empty response]' }];
      } else {
        this.messages = [...this.messages, { from: 'assistant', text: `Error ${res.status}: ${res.statusText}` }];
      }
    } catch (err) {
      this.messages = [...this.messages, { from: 'assistant', text: `Network error: ${err.message}` }];
    }
  }
}

customElements.define('my-chat-widget', MyChatWidget);
