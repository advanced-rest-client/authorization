/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { AuthorizationEvents } from '@advanced-rest-client/arc-events';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';
import { notifyChange, selectionHandler, inputHandler, CUSTOM_CREDENTIALS } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';
import '../oauth2-scope-selector.js';

/** @typedef {import('./AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('./Oauth2MethodMixin').GrantType} GrantType */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2DeliveryMethod} OAuth2DeliveryMethod */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('../').OAuth2ScopeSelectorElement} OAuth2ScopeSelectorElement */
/** @typedef {import('@advanced-rest-client/clipboard-copy').ClipboardCopyElement} ClipboardCopyElement */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-checkbox').AnypointCheckbox} AnypointCheckbox */

/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

export const clickCopyAction = Symbol('clickCopyAction');
export const scopesChanged = Symbol('scopesChanged');
export const oauth2RedirectTemplate = Symbol('oauth2RedirectTemplate');
export const oauth2GrantTypeTemplate = Symbol('oauth2GrantTypeTemplate');
export const oauth2AdvancedTemplate = Symbol('oauth2AdvancedTemplate');
export const oath2AuthorizeTemplate = Symbol('oath2AuthorizeTemplate');
export const oauth2TokenTemplate = Symbol('oauth2TokenTemplate');
export const advHandler = Symbol('advHandler');
export const readUrlValue = Symbol('readUrlValue');
export const setOauth2Defaults = Symbol('setOauth2Defaults');
export const authorizeOauth2 = Symbol('authorizeOauth2');
export const renderOauth2Auth = Symbol('renderOauth2Auth');
export const credentialsSourceTemplate = Symbol('credentialsSourceTemplate');
export const restoreOauth2Auth = Symbol('restoreOauth2Auth');
export const serializeOauth2Auth = Symbol('serializeOauth2Auth');
export const oauth2CustomPropertiesTemplate = Symbol('oauth2CustomPropertiesTemplate');
export const autoHide = Symbol('autoHide');
export const clearOauth2Auth = Symbol('clearOauth2Auth');
export const clientIdTemplate = Symbol('clientIdTemplate');
export const clientSecretTemplate = Symbol('clientSecretTemplate');
export const toggleAdvViewSwitchTemplate = Symbol('toggleAdvViewSwitchTemplate');
export const authorizationUriTemplate = Symbol('authorizationUriTemplate');
export const accessTokenUriTemplate = Symbol('accessTokenUriTemplate');
export const usernameTemplate = Symbol('usernameTemplate');
export const passwordTemplateLocal = Symbol('passwordTemplateLocal');
export const scopesTemplate = Symbol('scopesTemplate');
export const pkceTemplate = Symbol('pkceTemplate');
export const pkceChangeHandler = Symbol('pkceChangeHandler');
export const paramsLocationTemplate = Symbol('paramsLocationTemplate');
export const grantTypeSelectionHandler = Symbol('grantTypeSelectionHandler');
const credentialSourceHandler = Symbol('credentialSourceHandler');
const updateClientCredentials = Symbol('updateClientCredentials');
const updateCredentials = Symbol('updateCredentials');
const listCredentials = Symbol('listCredentials');
const isSourceSelected = Symbol('isSourceSelected');

/**
 * List of OAuth 2.0 default response types.
 * This list can be extended by custom grants
 *
 * @return {GrantType[]} List of objects with `type` and `label`
 * properties.
 */
export const oauth2GrantTypes = [
  {
    type: 'implicit',
    label: 'Access token (browser flow)',
  },
  {
    type: 'authorization_code',
    label: 'Authorization code (server flow)',
  },
  {
    type: 'client_credentials',
    label: 'Client credentials',
  },
  {
    type: 'password',
    label: 'Password',
  },
];

const makeNodeSelection = (node) => {
  const body = /** @type {HTMLBodyElement} */ (document.body);
  /* istanbul ignore if */
  // @ts-ignore
  if (body.createTextRange) {
    // @ts-ignore
    const range = body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

/**
 * A handler for `focus` event on a label that contains text and
 * should be copied to clipboard when user is interacting with it.
 *
 * @param {KeyboardEvent} e
 */
const selectFocusable = (e) => {
  const node = /** @type {HTMLElement} */ (e.target);
  makeNodeSelection(node);
};

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class Oauth2MethodMixinImpl extends base {
    /**
     * @return {boolean} Computed value, true if the response type is a custom definition.
     */
    get isCustomGrantType() {
      const { grantType } = this;
      return (!!grantType &&
        ![
          'implicit',
          'authorization_code',
          'client_credentials',
          'password',
        ].includes(grantType)
      );
    }

    get clientIdRequired() {
      const { grantType } = this;
      return !['client_credentials', 'password'].includes(grantType);
    }

    get oauth2ClientSecretRendered() {
      const { grantType, isCustomGrantType } = this;
      return (
        isCustomGrantType ||
        (!!grantType && ['authorization_code', 'client_credentials', 'password'].includes(grantType))
      );
    }

    get oauth2ClientSecretRequired() {
      const { grantType } = this;
      return ['authorization_code'].includes(grantType);
    }

    get oauth2AuthorizationUriRendered() {
      const { grantType, isCustomGrantType } = this;
      return (
        isCustomGrantType ||
        (!!grantType &&
          ['implicit', 'authorization_code'].includes(grantType))
      );
    }

    get oauth2AccessTokenUriRendered() {
      const { grantType, isCustomGrantType } = this;
      return (
        isCustomGrantType ||
        (!!grantType &&
          ['client_credentials', 'authorization_code', 'password'].includes(grantType))
      );
    }

    get oauth2PasswordRendered() {
      const { grantType, isCustomGrantType } = this;
      return (
        isCustomGrantType || (!!grantType && ['password'].includes(grantType))
      );
    }

    /**
     * @returns {boolean} True when the current `grantType` can support redirect URI.
     */
    get hasRedirectUri() {
      const { grantType } = this;
      return ['implicit', 'authorization_code'].includes(grantType);
    }

    static get properties() {
      return {
        /**
         * Selected authorization grand type.
         */
        grantType: { type: String },
        /**
         * The client ID for the auth token.
         */
        clientId: { type: String },
        /**
         * The client secret. It to be used when selected server flow.
         */
        clientSecret: { type: String },
        /**
         * List of user selected scopes.
         * It can be pre-populated with list of scopes (array of strings).
         */
        scopes: { type: Array },

        /**
         * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
         * element.
         */
        allowedScopes: { type: Array },
        /**
         * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
         * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
         */
        preventCustomScopes: { type: Boolean },
        /**
         * When the user authorized the app it should be set to the token value.
         * This element do not perform authorization. Other elements must intercept
         * the token request event and perform the authorization.
         */
        accessToken: { type: String },
        /**
         * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
         * If the token response contains `tokenType` property then this value is updated.
         */
        tokenType: { type: String },
        /**
         * Currently available grant types.
         */
        grantTypes: { type: Array },
        /**
         * If set it renders authorization url, token url and scopes as advanced options
         * which are then invisible by default. User can oen setting using the UI.
         */
        advanced: { type: Boolean },
        /**
         * If true then the advanced options are opened.
         */
        advancedOpened: { type: Boolean },
        /**
         * If set, the response type selector is hidden from the UI.
         */
        noGrantType: { type: Boolean },
        /**
         * Informs about what filed of the authenticated request the token property should be set.
         * By default the value is `header` which corresponds to the `authorization` by default,
         * but it is configured by the `deliveryName` property.
         *
         * This can be used by the AMF model when the API spec defines where the access token should be
         * put in the authenticated request.
         *
         * @default header
         */
        oauthDeliveryMethod: { type: String },
        /**
         * The client credentials delivery method.
         * @default body
         */
        ccDeliveryMethod: { type: String },
        /**
         * The name of the authenticated request property that carries the token.
         * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
         *
         * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
         * where to put the authorization token.
         *
         * @default authorization
         */
        oauthDeliveryName: { type: String },
        /**
         * The base URI to use to construct the correct URLs to the authorization endpoints.
         * 
         * When the paths are relative then base URI is added to the path.
         * Relative paths must start with '/'.
         * 
         * Note, URL processing is happening internally in the component. The produced authorize event
         * will have base URI already applied.
         */
        baseUri: { type: String },
        /**
         * The error message returned by the authorization library.
         * It renders error dialog when an error ocurred. 
         * It is automatically cleared when the user request the token again.
         */
        lastErrorMessage: { type: String },
        /** 
         * When this property is set then the PKCE option is not rendered for the 
         * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
         * to keep this control disabled and override generated settings when the API spec
         * says that the PKCE is supported.
         */
        noPkce: { type: Boolean },
        /** 
         * Whether or not the PKCE extension is enabled for this authorization configuration.
         * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
         */
        pkce: { type: Boolean },
        /**
         * List of credentials source
         */
        credentialsSource: { type: Array },
        /**
         * Selected credential source
         */
        credentialSource: { type: String },
      };
    }

    constructor() {
      super();
      /**
       * @type {GrantType[]}
       */
      this.grantTypes = [];
      this.noGrantType = false;
      this.noPkce = false;
      this.pkce = false;
      /** 
       * @type {OAuth2DeliveryMethod}
       */
      this.ccDeliveryMethod = 'body';
      this.credentialsDisabled = this.disabled;
    }

    /**
     * Restores previously serialized values
     * @param {OAuth2Authorization} settings
     */
    [restoreOauth2Auth](settings) {
      const type = settings.grantType;
      this.grantType = type;
      this.clientId = settings.clientId;
      this.accessToken = settings.accessToken;
      this.scopes = settings.scopes;
      if (settings.tokenType) {
        this.tokenType = settings.tokenType;
      }
      switch (type) {
        case 'implicit':
          this.authorizationUri = settings.authorizationUri;
          break;
        case 'authorization_code':
          this.authorizationUri = settings.authorizationUri;
          this.clientSecret = settings.clientSecret;
          this.accessTokenUri = settings.accessTokenUri;
          this.pkce = settings.pkce;
          break;
        case 'client_credentials':
          // The server flow.
          this.clientSecret = settings.clientSecret;
          this.accessTokenUri = settings.accessTokenUri;
          if (settings.deliveryMethod) {
            this.ccDeliveryMethod = settings.deliveryMethod;
          }
          break;
        case 'password':
          // The server flow.
          this.username = settings.username;
          this.password = settings.password;
          this.accessTokenUri = settings.accessTokenUri;
          this.clientSecret = settings.clientSecret;
          break;
        default:
          this.authorizationUri = settings.authorizationUri;
          this.clientSecret = settings.clientSecret;
          this.accessTokenUri = settings.accessTokenUri;
          this.username = settings.username;
          this.password = settings.password;
      }
    }

    /**
     * Serializes OAuth2 parameters into a configuration object.
     * @return {OAuth2Authorization}
     */
    [serializeOauth2Auth]() {
      const { grantType, tokenType, } = this;
      const detail = /** @type OAuth2Authorization */ ({
        grantType,
        tokenType,
        clientId: this.clientId,
        accessToken: this.accessToken || '',
        scopes: this.scopes,
        deliveryMethod: this.oauthDeliveryMethod,
        deliveryName: this.oauthDeliveryName,
      });

      switch (grantType) {
        case 'implicit':
          // The browser flow.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          break;
        case 'authorization_code':
          // The server flow.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.clientSecret = this.clientSecret;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          detail.pkce = this.pkce;
          break;
        case 'client_credentials':
          // The server flow.
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.clientSecret = this.clientSecret;
          if (this.ccDeliveryMethod) {
            detail.deliveryMethod = this.ccDeliveryMethod;
          } else {
            // historically it was body by default.
            detail.deliveryMethod = 'body';
          }
          break;
        case 'password':
          // The server flow.
          detail.username = this.username;
          detail.password = this.password;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.clientSecret = this.clientSecret;
          break;
        default:
          // Custom response type.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.clientSecret = this.clientSecret;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          detail.username = this.username;
          detail.password = this.password;
          break;
      }
      return detail;
    }

    /**
     * When defined and the `url` is a relative path staring with `/` then it
     * adds base URI to the path and returns concatenated value.
     *
     * @param {string} url
     * @return {string} Final URL value.
     */
    [readUrlValue](url) {
      const { baseUri } = this;
      if (!url || !baseUri) {
        return url;
      }
      url = String(url);
      if (url[0] === '/') {
        let uri = baseUri;
        if (uri[uri.length - 1] === '/') {
          uri = uri.substr(0, uri.length - 1);
        }
        return `${uri}${url}`;
      }
      return url;
    }

    [setOauth2Defaults]() {
      if (!this.oauthDeliveryName) {
        this.oauthDeliveryName = 'authorization';
      }
      if (!this.oauthDeliveryMethod) {
        this.oauthDeliveryMethod = 'header';
      }
      if (!Array.isArray(this.grantTypes) || !this.grantTypes.length) {
        this.grantTypes = oauth2GrantTypes;
      }
      this[autoHide]();
      if (!this.tokenType) {
        this.tokenType = 'Bearer';
      }
    }

    /**
     * Clears OAuth 1 auth settings
     */
    [clearOauth2Auth]() {
      this.tokenType = '';
      this.accessToken = '';
      this.grantType = '';
      this.scopes = /** @type string[] */ ([]);
      this.oauthDeliveryMethod = undefined;
      this.oauthDeliveryName = undefined;
      this.authorizationUri = '';
      this.accessTokenUri = '';
      this.clientId = '';
      this.clientSecret = '';
      this.username = '';
      this.password = '';

      this[setOauth2Defaults]();
    }

    /**
     * Performs the authorization.
     * 
     * @returns {Promise<TokenInfo|null>} The auth token or null if couldn't be requested.
     * @throws {Error} When authorization error
     */
    async [authorizeOauth2]() {
      if (this.lastErrorMessage) {
        this.lastErrorMessage = undefined;
      }
      const validationResult = this.validate();
      if (!validationResult) {
        return null;
      }
      this._authorizing = true;
      const detail = this[serializeOauth2Auth]();
      const state = this.generateState();
      detail.state = state;
      let tokenInfo = /** @type TokenInfo */(null);
      try {
        tokenInfo = await AuthorizationEvents.OAuth2.authorize(this, detail);
        this._authorizing = false;
        if (!tokenInfo) {
          return null;
        }
        if (detail.grantType === 'implicit' && tokenInfo.state !== state) {
          return null;
        }
        if (tokenInfo.accessToken && tokenInfo.accessToken !== this.accessToken) {
          if (tokenInfo.tokenType && tokenInfo.tokenType !== this.tokenType) {
            this.tokenType = tokenInfo.tokenType;
          } else if (!tokenInfo.tokenType && this.tokenType !== 'Bearer') {
            this.tokenType = 'Bearer';
          }
          this.accessToken = tokenInfo.accessToken;
          notifyChange(this);
        }
      } catch (e) {
        const { message = 'Unknown error' } = e;
        this.lastErrorMessage = message;
        this._authorizing = false;
        await this.requestUpdate();
        throw e;
      }
      return tokenInfo;
    }

    /**
     * Generates `state` parameter for the OAuth2 call.
     *
     * @return {string} Generated state string.
     */
    generateState() {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    /**
     * This function hides all non-crucial fields that has been pre-filled when element has been
     * initialize (values not provided by the user). Hidden fields will be available under
     * "advanced" options.
     *
     * To prevent this behavior set `no-auto` attribute on this element.
     */
    [autoHide]() {
      const { grantType, scopes } = this;
      const hasScopes = !!(scopes && scopes.length);
      let advOpened;
      switch (grantType) {
        case 'implicit':
          advOpened = !(hasScopes && !!this.authorizationUri);
          break;
        case 'authorization_code':
          advOpened = !(
            hasScopes &&
            !!this.authorizationUri &&
            !!this.accessTokenUri
          );
          break;
        case 'client_credentials':
          advOpened = !this.accessTokenUri;
          break;
        default:
          advOpened = true;
          break;
      }
      this.advancedOpened = advOpened;
      if (!advOpened) {
        this.advanced = true;
      }
    }

    /**
     * A handler for `focus` event on a label that contains text and
     * should be copied to clipboard when user is interacting with it.
     *
     * @param {MouseEvent} e
     */
    [clickCopyAction](e) {
      const node = /** @type {HTMLElement} */ (e.target);
      const elm = /** @type ClipboardCopyElement */ (this.shadowRoot.querySelector('clipboard-copy'));
      elm.content = node.innerText;
      /* istanbul ignore if */
      if (elm.copy()) {
        // this.shadowRoot.querySelector('#clipboardToast').opened = true;
      }
      setTimeout(() => makeNodeSelection(node));
    }

    /**
     * Event handler for the scopes element changed state
     * @param {CustomEvent} e
     */
    [scopesChanged](e) {
      this.scopes = /** @type OAuth2ScopeSelectorElement */ (e.target).value;
      notifyChange(this);
    }

    [advHandler](e) {
      this.advancedOpened = e.target.checked;
    }

    /**
     * The handler for the change event coming from the PKCE input checkbox
     * @param {Event} e
     */
    [pkceChangeHandler](e) {
      const node = /** @type AnypointCheckbox */ (e.target);
      this.pkce = node.checked;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 redirect URI label
     */
    [oauth2RedirectTemplate]() {
      const { redirectUri, hasRedirectUri } = this;
      if (!hasRedirectUri) {
        return '';
      }
      return html`
      <div class="subtitle">Redirect URI</div>
      <section>
        <div class="redirect-section">
          <p class="redirect-info">
            Set this redirect URI in OAuth 2.0 provider settings.
          </p>
          <p class="read-only-param-field padding">
            <span
              class="code"
              @click="${this[clickCopyAction]}"
              @focus="${selectFocusable}"
              title="Click to copy the URI"
              tabindex="0"
            >${redirectUri}</span>
          </p>
        </div>
      </section>
      `;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 response type selector
     */
    [oauth2GrantTypeTemplate]() {
      const {
        grantType,
        outlined,
        compatibility,
        readOnly,
        disabled,
        noGrantType,
        isCustomGrantType,
      } = this;
      const items = this.grantTypes || [];
      return html`
      <anypoint-dropdown-menu
        name="grantType"
        ?required="${!isCustomGrantType}"
        class="grant-dropdown"
        ?hidden="${noGrantType}"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .disabled="${disabled||readOnly}"
      >
        <label slot="label">Response type</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${grantType}"
          @selected-changed="${this[grantTypeSelectionHandler]}"
          data-name="grantType"
          .compatibility="${compatibility}"
          .disabled="${disabled||readOnly}"
          attrforselected="data-value"
        >
          ${items.map((item) => html`
          <anypoint-item
            .compatibility="${compatibility}"
            data-value="${item.type}"
          >${item.label}</anypoint-item>`)}
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 advanced options.
     */
    [oauth2AdvancedTemplate]() {
      const {
        advancedOpened,
        baseUri,
      } = this;
      // When the baseUri is set then validation won't allow to provide
      // relative paths to the authorization endpoint hence this should be
      // defined as string and not "url".
      const urlType = baseUri ? 'string' : 'url';
      return html`
      <div class="advanced-section" ?hidden="${!advancedOpened}">
        ${this[authorizationUriTemplate](urlType)}
        ${this[accessTokenUriTemplate](urlType)}
        ${this[usernameTemplate]()}
        ${this[passwordTemplateLocal]()}
        ${this[scopesTemplate]()}
        ${this[paramsLocationTemplate]()}
        ${this[pkceTemplate]()}
      </div>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the "authorize" button.
     */
    [oath2AuthorizeTemplate]() {
      const { _authorizing, compatibility } = this;
      return html`
      <div class="authorize-actions">
        <anypoint-button
          ?disabled="${_authorizing}"
          class="auth-button"
          ?compatibility="${compatibility}"
          emphasis="medium"
          data-type="get-token"
          @click="${this.authorize}"
        >Request access token</anypoint-button>
      </div>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 token value
     */
    [oauth2TokenTemplate]() {
      const { accessToken, compatibility, _authorizing } = this;
      return html`
      <div class="current-token">
        <label class="token-label">Current token</label>
        <p class="read-only-param-field padding">
          <span class="code" @click="${this[clickCopyAction]}">${accessToken}</span>
        </p>
        <div class="authorize-actions">
          <anypoint-button
            ?disabled="${_authorizing}"
            class="auth-button"
            ?compatibility="${compatibility}"
            emphasis="medium"
            data-type="refresh-token"
            @click="${this.authorize}"
          >Refresh access token</anypoint-button>
        </div>
      </div>`;
    }

    [listCredentials]() {
      const {credentialsSource, grantType} =  this;
      let credentials = [];

      if (credentialsSource && credentialsSource.length > 0) {
        const grantTypeCredentials = credentialsSource.find(s => s.grantType === grantType);
        if (grantTypeCredentials) {
          const customCredential = { name: CUSTOM_CREDENTIALS };
          credentials = [customCredential].concat(grantTypeCredentials.credentials)
        }
      }

      return credentials
    };

    [updateCredentials](clientId, clientSecret, disabled) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.credentialsDisabled = disabled
    }

    [updateClientCredentials](selectedSource) {
      const {clientId, clientSecret, credentialsDisabled, credentialsSource} = this;

      if (credentialsSource){
        if (selectedSource) {
          const credentials = this[listCredentials]();
          const credential = credentials.find(c => c.name === selectedSource);
          if (credential) {
            this[updateCredentials](credential.clientId, credential.clientSecret, credential.name !== CUSTOM_CREDENTIALS)
          }
        } else {
          this[updateCredentials]('', '', true);
        }
      }

      return {clientId, clientSecret, credentialsDisabled}
    };

    /**
     * @param {Event} e 
     */
    [grantTypeSelectionHandler](e) {
      const { selected } = /** @type AnypointListbox */ (e.target);
      const { grantType, credentialSource } = this;
      if (grantType !== selected && credentialSource) {
        this.credentialSource = undefined;
        this.credentialsDisabled = this.disabled;
      }

      this[selectionHandler](e);
    }

    /**
     * @param {Event} e 
     */
    [credentialSourceHandler](e) {
      const { selected } = /** @type AnypointListbox */ (e.target);
      this[updateClientCredentials](selected);
      this[selectionHandler](e);
    }

    [isSourceSelected]() {
      const { credentialSource } = this;

      const credentials = this[listCredentials]();
      if (credentials.length > 0) {
        if (!credentialSource) {
          return false;
        }
      }

      return true
    }

    [credentialsSourceTemplate]() {
      const {
        outlined,
        compatibility,
        credentialSource,
      } = this;

      const credentials = this[listCredentials]();
      if (credentials.length === 0) {
        return '';
      }

      return html`
      <anypoint-dropdown-menu
        name="credentialSource"
        required
        class="credential-source-dropdown"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
      >
        <label slot="label">Credentials source</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${credentialSource}"
          @selected-changed="${this[credentialSourceHandler]}"
          data-name="credentialSource"
          .compatibility="${compatibility}"
          attrforselected="data-value"
        >
        ${credentials.map((item) => html`
          <anypoint-item
            .compatibility="${compatibility}"
            data-value="${item.name}"
          >${item.name}</anypoint-item>`)}
        </anypoint-listbox>
      </anypoint-dropdown-menu>
  `;
    };

    /**
     * @returns {TemplateResult} The template for the OAuth 2 editor.
     */
    [renderOauth2Auth]() {
      const {
        accessToken,
        lastErrorMessage,
      } = this;
      return html`
      <form autocomplete="on" class="oauth2-auth">
        ${this[oauth2GrantTypeTemplate]()}
        ${this[credentialsSourceTemplate]()}        
        ${this[clientIdTemplate]()}
        ${this[clientSecretTemplate]()}
        ${this[oauth2CustomPropertiesTemplate]()}
        ${this[toggleAdvViewSwitchTemplate]()}
        ${this[oauth2AdvancedTemplate]()}
      </form>
      ${this[oauth2RedirectTemplate]()}
      ${accessToken ? this[oauth2TokenTemplate]() : this[oath2AuthorizeTemplate]()}
      ${lastErrorMessage ? html`<p class="error-message">⚠ ${lastErrorMessage}</p>` : ''}
      <clipboard-copy></clipboard-copy>
      `;
    }

    [oauth2CustomPropertiesTemplate]() {
      return '';
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 client secret input.
     */
    [clientSecretTemplate]() {
      const { oauth2ClientSecretRendered } = this;
      if (!oauth2ClientSecretRendered) {
        return '';
      }
      const { clientSecret, outlined, compatibility, readOnly, credentialsDisabled, oauth2ClientSecretRequired } = this;
      const sourceSelected = this[isSourceSelected]();
      return passwordTemplate(
        'clientSecret',
        clientSecret,
        'Client secret',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled: sourceSelected ? credentialsDisabled : true,
          required: oauth2ClientSecretRequired,
          autoValidate: true,
          invalidLabel: 'Client secret is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 client id input.
     */
    [clientIdTemplate]() {
      const { clientId, outlined, compatibility, readOnly, credentialsDisabled, clientIdRequired } = this;
      const sourceSelected = this[isSourceSelected]();
      return passwordTemplate(
        'clientId',
        clientId,
        'Client id',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled: sourceSelected ? credentialsDisabled : true,
          required: clientIdRequired,
          autoValidate: true,
          invalidLabel: 'Client ID is required for this response type',
          infoLabel: clientIdRequired
            ? undefined
            : 'Client id is optional for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the toggle advanced view switch
     */
    [toggleAdvViewSwitchTemplate]() {
      const { advanced } = this;
      if (!advanced) {
        return '';
      }
      const { readOnly, advancedOpened, compatibility } = this;
      return html` 
      <div class="adv-toggle">
        <anypoint-switch
          class="adv-settings-input"
          .checked="${advancedOpened}"
          @change="${this[advHandler]}"
          ?disabled="${readOnly}"
          ?compatibility="${compatibility}"
        >Advanced settings</anypoint-switch>
      </div>`;
    }

    /**
     * @param {string} urlType The input type to render
     * @returns {TemplateResult|string} The template for the authorization URI input
     */
    [authorizationUriTemplate](urlType) {
      if (!this.oauth2AuthorizationUriRendered) {
        return '';
      }
      const { readOnly, authorizationUri, compatibility, outlined, disabled, isCustomGrantType } = this;
      return inputTemplate(
        'authorizationUri',
        authorizationUri,
        'Authorization URI',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          type: urlType,
          required: !isCustomGrantType,
          autoValidate: true,
          invalidLabel: 'Authorization URI is required for this response type',
        }
      );
    }

    /**
     * @param {string} urlType The input type to render
     * @returns {TemplateResult|string} The template for the access token URI input
     */
    [accessTokenUriTemplate](urlType) {
      if (!this.oauth2AccessTokenUriRendered) {
        return '';
      }
      const { readOnly, accessTokenUri, compatibility, outlined, disabled, isCustomGrantType } = this;
      return inputTemplate(
        'accessTokenUri',
        accessTokenUri,
        'Access token URI',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          type: urlType,
          required: !isCustomGrantType,
          autoValidate: true,
          invalidLabel: 'Access token URI is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the user name input
     */
    [usernameTemplate]() {
      if (!this.oauth2PasswordRendered) {
        return '';
      }
      const { readOnly, username, compatibility, outlined, disabled, isCustomGrantType } = this;
      return inputTemplate(
        'username',
        username,
        'Username',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: !isCustomGrantType,
          autoValidate: true,
          invalidLabel: 'User name is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the user password input
     */
    [passwordTemplateLocal]() {
      if (!this.oauth2PasswordRendered) {
        return '';
      }
      const { readOnly, password, compatibility, outlined, disabled, isCustomGrantType } = this;
      return inputTemplate(
        'password',
        password,
        'Password',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: !isCustomGrantType,
          autoValidate: true,
          invalidLabel: 'Password is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult} The template for the OAuth 2 scopes input
     */
    [scopesTemplate]() {
      const {
        allowedScopes,
        preventCustomScopes,
        outlined,
        compatibility,
        readOnly,
        disabled,
        scopes,
      } = this;
      return html`
      <oauth2-scope-selector
        .allowedScopes="${allowedScopes}"
        .preventCustomScopes="${preventCustomScopes}"
        .value="${scopes}"
        ?readOnly="${readOnly}"
        ?disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        name="scopes"
        @change="${this[scopesChanged]}"
      ></oauth2-scope-selector>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the PKCE option of the OAuth 2 extension.
     */
    [pkceTemplate]() {
      const { grantType, noPkce, pkce } = this;
      if (noPkce || grantType !== 'authorization_code') {
        return '';
      }
      return html`
      <anypoint-checkbox
        .checked="${pkce}"
        title="Enables PKCE extension of the OAuth 2 protocol."
        name="pkce"
        @change="${this[pkceChangeHandler]}"
      >Use PKCE extension</anypoint-checkbox>
      `;
    }

    [paramsLocationTemplate]() {
      const { grantType } = this;
      if (grantType !== 'client_credentials') {
        return '';
      }
      const { ccDeliveryMethod, outlined, compatibility, disabled, readOnly } = this;
      return html`
      <anypoint-dropdown-menu
        name="ccDeliveryMethod"
        class="delivery-dropdown"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .disabled="${disabled||readOnly}"
      >
        <label slot="label">Credentials location</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${ccDeliveryMethod}"
          @selected-changed="${this[selectionHandler]}"
          data-name="ccDeliveryMethod"
          .compatibility="${compatibility}"
          .disabled="${disabled||readOnly}"
          attrforselected="data-value"
        >
          <anypoint-item .compatibility="${compatibility}" data-value="header">Authorization header</anypoint-item>
          <anypoint-item .compatibility="${compatibility}" data-value="body">Message body</anypoint-item>
        </anypoint-listbox>
      </anypoint-dropdown-menu>
      `;
    }
  }
  return Oauth2MethodMixinImpl;
};

/**
 * A mixin that adds support for OAuth 2 method computations.
 *
 * @mixin
 */
export const Oauth2MethodMixin = dedupeMixin(mxFunction);
