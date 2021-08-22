/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import OAuth2 from './OAuth2.js';
import { inputTemplate } from '../../CommonTemplates.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('../../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../../types').OpenIdProviderMetadata} OpenIdProviderMetadata */
/** @typedef {import('../../types').GrantType} GrantType */
/** @typedef {import('../../types').Oauth2ResponseType} Oauth2ResponseType */

export const GrantLabels = {
  implicit: 'Access token',
  authorization_code: 'Authorization code',
  refresh_token: 'Refresh token',
  password: 'Password',
  client_credentials: 'Client credentials',
  'urn:ietf:params:oauth:grant-type:device_code': 'Device code',
  'urn:ietf:params:oauth:grant-type:jwt-bearer': 'JWT Bearer',
};

export const ResponseTypeLabels = {
  token: 'Token',
  code: 'Code',
  id_token: 'ID token',
  id: 'ID token',
};

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
    this.lastErrorMessage = undefined;
    this.requestUpdate();
    try {
      const rsp = await fetch(this.buildIssuerUrl(issuerUrl));
      const info = await rsp.json();
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

  render() {
    const {
      accessToken,
      lastErrorMessage,
      discovered,
    } = this;
    return html`
    <form autocomplete="on" class="oauth2-auth">
      ${this.issuerInputTemplate()}
      ${discovered ? this.formContentTemplate() : ''}
    </form>
    ${this.oauth2RedirectTemplate()}
    ${accessToken ? this.oauth2TokenTemplate() : this.oath2AuthorizeTemplate()}
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
}
