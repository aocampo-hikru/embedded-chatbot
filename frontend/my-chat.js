// Minimal LitElement chat widget with MSAL authentication
import {LitElement, html, css} from 'https://unpkg.com/lit@2/index.js?module';
import {PublicClientApplication} from 'https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.esm.min.js';

class MyChat extends LitElement {
  static properties = {
    messages: {state: true},
    token: {state: true}
  };

  static styles = css`
    :host{display:block;border:1px solid #ccc;padding:8px;width:300px;font-family:sans-serif}
    .messages{max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:4px;margin-bottom:4px}
    .messages div{margin-bottom:4px}
    input{width:100%;box-sizing:border-box}
  `;

  constructor(){
    super();
    const cfg = window.MY_CHAT_CONFIG || {};
    this.apiBase = cfg.apiBase || '';
    this.clientId = cfg.clientId || '';
    this.tenantId = cfg.tenantId || '';
    this.messages = [];
    this.token = null;
    this.msal = new PublicClientApplication({
      auth: {clientId: this.clientId, authority: `https://login.microsoftonline.com/${this.tenantId}`},
      cache: {cacheLocation: 'sessionStorage'}
    });
  }

  render(){
    return this.token ? this.renderChat() : html`<button @click=${this.login}>Login</button>`;
  }

  renderChat(){
    return html`
      <div class="messages">
        ${this.messages.map(m => html`<div><b>${m.from}:</b> ${m.text}</div>`)}
      </div>
      <input placeholder="Ask..." @keydown=${this.handleKey} />
    `;
  }

  async login(){
    const result = await this.msal.loginPopup({scopes:['chat.access']});
    this.token = result.accessToken;
  }

  async handleKey(e){
    if(e.key==='Enter' && e.target.value.trim()){
      const text = e.target.value.trim();
      e.target.value='';
      this.messages = [...this.messages,{from:'user',text}];
      const res = await fetch(`${this.apiBase}/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${this.token}`},
        body:JSON.stringify({query:text})
      });
      const data = await res.json();
      this.messages = [...this.messages,{from:'assistant',text:data.answer}];
    }
  }
}

customElements.define('my-chat', MyChat);
