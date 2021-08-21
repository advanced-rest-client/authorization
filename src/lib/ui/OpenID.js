/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import OAuth2 from './OAuth2.js';
import { inputTemplate } from '../../CommonTemplates.js';

/** @typedef {import('../../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../../types').OpenIdProviderMetadata} OpenIdProviderMetadata */
/** @typedef {import('../../types').GrantType} GrantType */
/** @typedef {import('../../types').Oauth2ResponseType} Oauth2ResponseType */

export const GrantLabels = {
  implicit: 'Access token',
  authorization_code: 'Authorization code',
  refresh_token: 'Refresh token',
  password: 'Password',
  'urn:ietf:params:oauth:grant-type:device_code': 'Device code',
  'urn:ietf:params:oauth:grant-type:jwt-bearer': 'JWT Bearer',
};

export const ResponseTypeLabels = {
  token: 'Token',
  code: 'Code',
  id_token: 'ID token',
  id: 'ID token',
}

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

    this._issuerUriHandler = this._issuerUriHandler.bind(this);
    this._issuerReadHandler = this._issuerReadHandler.bind(this);
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
   * Downloads the OIDC info and pre-populates the form inputs.
   */
  async discover() {
    const { issuerUrl } = this;
    this.lastErrorMessage = undefined;
    this.requestUpdate();
    try {
      const rsp = await fetch(issuerUrl);
      const info = await rsp.json();
      this.propagateOidc(info);
      this.discovered = true;
      this.notifyChange();
    } catch (e) {
      this.lastErrorMessage = `Unable to read the discovery information.`;
    }
    this.requestUpdate();
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
    if (Array.isArray(meta.grant_types_supported)) {
      this.grantTypes = this.translateGrantTypesMeta(meta.grant_types_supported);
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
}
