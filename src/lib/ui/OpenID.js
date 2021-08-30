/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { AuthorizationEvents } from "@advanced-rest-client/arc-events";
import '@github/time-elements';
import OAuth2 from './OAuth2.js';
import { inputTemplate } from '../../CommonTemplates.js';
import { generateState, selectNode } from "../../Utils.js";
import * as KnownGrants from '../KnownGrants.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('../../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../../types').OpenIdProviderMetadata} OpenIdProviderMetadata */
/** @typedef {import('../../types').GrantType} GrantType */
/** @typedef {import('../../types').Oauth2ResponseType} Oauth2ResponseType */

export const GrantLabels = {
  [KnownGrants.implicit]: 'Access token',
  [KnownGrants.code]: 'Authorization code',
  refresh_token: 'Refresh token',
  [KnownGrants.password]: 'Password',
  [KnownGrants.clientCredentials]: 'Client credentials',
  [KnownGrants.deviceCode]: 'Device code',
  [KnownGrants.jwtBearer]: 'JWT Bearer',
};

export const ResponseTypeLabels = {
  token: 'Token',
  code: 'Code',
  id_token: 'ID token',
  id: 'ID token',
};

export const discoveryCache = new Map();

/**
 * @return {GrantType[]} The default grant types for OIDC
 */
export const defaultGrantTypes = [
  {
    type: "implicit",
    label: "Access token (browser flow)",
  },
  {
    type: "authorization_code",
    label: "Authorization code (server flow)",
  },
];

export default class OpenID extends OAuth2 {
  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /** @type boolean */
    this.discovered = false;
    /** @type string */
    this.issuerUrl = undefined;
    /** @type {(OidcTokenInfo | OidcTokenError)[]} */
    this.tokens = undefined;
    /** @type number */
    this.selectedToken = undefined;
    /** @type number */
    this.expiresAt = undefined;
    /** @type Oauth2ResponseType[][] */
    this.supportedResponses = undefined;
    /** 
     * The index of the response from the `supportedResponses`.
     * By default it selects the first one.
     * @type number 
     */
    this.selectedResponse = undefined;

    this._issuerUriHandler = this._issuerUriHandler.bind(this);
    this._issuerReadHandler = this._issuerReadHandler.bind(this);
    this._responseTypeSelectionHandler = this._responseTypeSelectionHandler.bind(this);
    this._selectNodeHandler = this._selectNodeHandler.bind(this);
    this._selectedTokenHandler = this._selectedTokenHandler.bind(this);
  }

  /**
   * Serialized input values
   * @return {OAuth2Authorization} An object with user input
   */
  serialize() {
    const result = super.serialize();
    delete result.accessToken;
    const { selectedResponse=0, supportedResponses=[], tokens, selectedToken=0 } = this;
    const response = supportedResponses[selectedResponse];
    if (response) {
      result.responseType = response.map(i => i.type).join(' ');
    }
    if (Array.isArray(tokens)) {
      result.accessToken = this.readTokenValue(/** @type OidcTokenInfo */ (tokens[selectedToken]));
    }
    if (result.responseType && !this.noPkce && result.responseType.includes('code')) {
      result.pkce = this.pkce;
    }
    return result;
  }

  async authorize() {
    if (this.lastErrorMessage) {
      this.lastErrorMessage = undefined;
    }
    const validationResult = this.target.validate();
    if (!validationResult) {
      return null;
    }
    this.authorizing = true;
    this.requestUpdate();
    this.notifyChange();
    const detail = this.serialize();
    const state = generateState();
    detail.state = state;

    try {
      const tokens = await AuthorizationEvents.Oidc.authorize(this.target, detail);
      this.authorizing = false;
      this.requestUpdate();
      this.notifyChange();
      if (!Array.isArray(tokens) || !tokens.length) {
        return null;
      }
      this.tokens = tokens;
      this.accessToken = undefined;
      this.selectedToken = 0;
      this.requestUpdate();
      this.notifyChange();
    } catch (e) {
      const { message = 'Unknown error' } = e;
      this.lastErrorMessage = message;
      this.authorizing = false;
      this.requestUpdate();
      this.notifyChange();
      throw e;
    }

    this.requestUpdate();
    return null;
  }

  /**
   * @param {Event} e
   */
  _issuerUriHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    this.issuerUrl = input.value;
    this.notifyChange();
    this.discover();
  }

  _issuerReadHandler() {
    const { issuerUrl } = this;
    if (!issuerUrl) {
      this.lastErrorMessage = 'Set the issuer URI first.';
      this.requestUpdate();
      return;
    }
    this.discover();
  }

  /**
   * @param {Event} e 
   */
  _responseTypeSelectionHandler(e) {
    const { selected } = /** @type AnypointListbox */ (e.target);
    this.selectedResponse = /** @type number */ (selected);
    this.notifyChange();
  }

  /**
   * Downloads the OIDC info and pre-populates the form inputs.
   */
  async discover() {
    const { issuerUrl } = this;
    const oidcUrl = this.buildIssuerUrl(issuerUrl);
    if (discoveryCache.has(oidcUrl)) {
      const info = discoveryCache.get(oidcUrl);
      this.propagateOidc(info);
      this.discovered = true;
      this.notifyChange();
      return;
    }
    this.lastErrorMessage = undefined;
    this.requestUpdate();
    try {
      const rsp = await fetch(oidcUrl);
      const info = await rsp.json();
      discoveryCache.set(oidcUrl, info);
      this.propagateOidc(info);
      this.discovered = true;
      this.notifyChange();
    } catch (e) {
      this.lastErrorMessage = `Unable to read the discovery information.`;
      this.discovered = false;
    }
    this.requestUpdate();
  }

  /**
   * Constructs the OIDC discovery URL.
   * @param {string} baseUri The issues URI.
   * @returns {string}
   */
  buildIssuerUrl(baseUri) {
    let url = baseUri;
    if (!url.includes('.well-known')) {
      if (!url.endsWith('/')) {
        url += '/';
      }
      url += '.well-known/openid-configuration';
    }
    return url;
  }

  /**
   * @param {OpenIdProviderMetadata} meta
   */
  propagateOidc(meta) {
    this.authorizationUri = meta.authorization_endpoint;
    this.supportedResponses = this.translateResponseCodes(meta.response_types_supported);
    if (meta.token_endpoint) {
      this.accessTokenUri = meta.token_endpoint;
    }
    if (Array.isArray(meta.grant_types_supported) && meta.grant_types_supported.length) {
      this.grantTypes = this.translateGrantTypesMeta(meta.grant_types_supported);
    } else {
      this.grantTypes = [...defaultGrantTypes];
    }
    if (Array.isArray(meta.scopes_supported)) {
      this.scopes = meta.scopes_supported;
    } else {
      this.scopes = ['openid'];
    }
  }

  /**
   * @param {string[]} types
   * @returns {GrantType[]}
   */
  translateGrantTypesMeta(types) {
    const result = [];
    types.forEach((type) => {
      const item = {
        type,
        label: type,
      };
      if (GrantLabels[type]) {
        item.label = GrantLabels[type];
      }
      result.push(item);
    });
    return result;
  }

  /**
   * This generates a 2-dimensional array with the response codes 
   * supported by the authorization server. Next to the grant type 
   * it describes how token is received by the 
   * @param {string[]} codes
   * @return {Oauth2ResponseType[][]} 
   */
  translateResponseCodes(codes) {
    const result = [];
    codes.forEach((value) => {
      const items = value.split(' ');
      const response = [];
      result.push(response)
      items.forEach((responseValue) => {
        const type = {
          type: responseValue,
          label: responseValue,
        };
        if (ResponseTypeLabels[responseValue]) {
          type.label = ResponseTypeLabels[responseValue];
        }
        response.push(type);
      });
    });
    return result;
  }

  /**
   * A handler to select the contents of the node that is the event's target.
   * @param {Event} e
   */
  _selectNodeHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    selectNode(node);
  }

  /**
   * @param {Event} e
   */
  _selectedTokenHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { value } = input;
    if (!input.checked) {
      return;
    }
    this.selectedToken = Number(value);
    this.notifyChange();
  }

  /**
   * @param {OidcTokenInfo|OidcTokenError} token
   */
  readTokenLabel(token) {
    const { responseType } = token;
    switch (responseType) {
      case 'token': return 'Access token';
      case 'code': return 'Access token from code exchange';
      case 'id_token': 
      case 'id': return 'ID token'; 
      default: return 'Unknown token';
    }
  }

  /**
   * @param {OidcTokenInfo} token
   */
  readTokenValue(token) {
    const { responseType } = token;
    switch (responseType) {
      case 'token': return token.accessToken;
      case 'code': return token.accessToken;
      case 'id_token': 
      case 'id': return token.idToken;
      default: return token.accessToken || token.refreshToken || token.idToken || '';
    }
  }

  render() {
    const {
      tokens,
      lastErrorMessage,
      discovered,
    } = this;
    return html`
    <form autocomplete="on" class="oauth2-auth">
      ${this.issuerInputTemplate()}
      ${discovered ? this.formContentTemplate() : ''}
    </form>
    ${this.oauth2RedirectTemplate()}
    ${Array.isArray(tokens) && tokens.length ? this.oauth2TokenTemplate() : this.oath2AuthorizeTemplate()}
    ${lastErrorMessage ? html`<p class="error-message">⚠ ${lastErrorMessage}</p>` : ''}
    <clipboard-copy></clipboard-copy>
    `;
  }

  issuerInputTemplate() {
    const { readOnly, issuerUrl, anypoint, outlined, disabled } = this;
    const input = inputTemplate(
      'issuerUrl',
      issuerUrl,
      'Issuer URI',
      this._issuerUriHandler,
      {
        outlined,
        compatibility: anypoint,
        readOnly,
        disabled,
        type: 'url',
        required: true,
        autoValidate: true,
        invalidLabel: 'Issuer URI is required',
        infoLabel: 'The URI without the .well-known part.',
      }
    );
    return html`
    <div class="issuer-input">
      ${input}
      <anypoint-button 
        ?compatibility="${anypoint}"
        title="Downloads and processes the discovery info"
        @click="${this._issuerReadHandler}"
      >Read</anypoint-button>
    </div>
    `;
  }

  /**
   * @returns {(string|TemplateResult)[]} 
   */
  formContentTemplate() {
    const parts = super.formContentTemplate();
    parts.unshift(this.responsesTemplate())
    return parts;
  }

  /**
   * @returns {TemplateResult|string} The template for the response types drop down.
   */
  responsesTemplate() {
    const { supportedResponses } = this;
    if (!Array.isArray(supportedResponses) || !supportedResponses.length) {
      return '';
    }
    const {
      selectedResponse=0,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    return html`
    <anypoint-dropdown-menu
      name="responseType"
      required
      class="response-type-dropdown"
      .outlined="${outlined}"
      .compatibility="${anypoint}"
      .disabled="${disabled||readOnly}"
    >
      <label slot="label">Response type</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${selectedResponse}"
        @selected="${this._responseTypeSelectionHandler}"
        data-name="responseType"
        .compatibility="${anypoint}"
        .disabled="${disabled||readOnly}"
      >
        ${supportedResponses.map(item => this.responseItemTemplate(item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * @param {Oauth2ResponseType[]} item The responses list to render as a single item.
   * @returns {TemplateResult|string} The template for the response types drop down item.
   */
  responseItemTemplate(item) {
    const label = item.map(i => i.label).join(', ');
    return html`
    <anypoint-item
      .compatibility="${this.anypoint}"
    >${label}</anypoint-item>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 token value
   */
  oauth2TokenTemplate() {
    const { tokens, authorizing, anypoint } = this;
    return html`
    <div class="current-tokens">
      <p class="tokens-title">Tokens</p>
      ${tokens.map((info, index) => this.tokenTemplate(info, index))}

      <div class="authorize-actions">
        <anypoint-button
          ?disabled="${authorizing}"
          class="auth-button"
          ?compatibility="${anypoint}"
          emphasis="medium"
          data-type="refresh-token"
          @click="${this.authorize}"
        >Refresh tokens</anypoint-button>
      </div>
    </div>`;
  }

  /**
   * @param {OidcTokenInfo | OidcTokenError} token 
   * @param {number} index
   * @returns 
   */
  tokenTemplate(token, index) {
    const typedError = /** @type OidcTokenError */ (token);
    if (typedError.error) {
      return this.errorTokenTemplate(typedError);
    }
    return this.infoTokenTemplate(/** @type OidcTokenInfo */ (token), index);
  }

  /**
   * @param {OidcTokenError} token
   */
  errorTokenTemplate(token) {
    const { error, errorDescription } = token;
    const label = this.readTokenLabel(token);
    return html`
    <div class="current-token">
      <label class="token-label">${label}</label>
      <p class="read-only-param-field padding">
        <span class="code">${error}: ${errorDescription}</span>
      </p>
    </div>`;
  }

  /**
   * @param {OidcTokenInfo} token
   * @param {number} index
   */
  infoTokenTemplate(token, index) {
    const { responseType } = token;
    const label = this.readTokenLabel(token);
    const value = this.readTokenValue(token);
    return html`
    <div class="token-option">
      <input 
        type="radio" 
        id="${responseType}" 
        name="selectedToken" 
        .value="${String(index)}" 
        ?checked="${this.selectedToken === index}"
        @change="${this._selectedTokenHandler}"
      >
      <div class="token-info">
        <label for="${responseType}" class="token-label">
          ${label}
        </label>
        ${this.tokenExpirationTemplate(token)}
        <div class="token-value code" title="${value}" @click="${this._selectNodeHandler}" @keydown="${this._copyKeydownHandler}">${value.trim()}</div>
      </div>
    </div>
    `;
  }

  /**
   * @param {OidcTokenInfo} token
   */
  tokenExpirationTemplate(token) {
    const { time, expiresIn } = token;
    if (!time || !expiresIn) {
      return '';
    }
    const d = new Date(time + (expiresIn*1000));
    const expTime = d.toISOString();
    const expired = Date.now() > d.getTime();
    const label = expired ? 'Expired' : 'Expires';
    return html`
    <div class="token-expires">
      ${label} <relative-time datetime="${expTime}"></relative-time>
    </div>
    `;
  }
}
