import { html, LitElement } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import authStyles from './styles/CommonAuthStyles.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-masked-input.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';

/* eslint-disable class-methods-use-this */

import {
  BasicMethodMixin,
  serializeBasicAuth,
  restoreBasicAuth,
  renderBasicAuth,
  clearBasicAuth,
} from './BasicMethodMixin.js';
import {
  BearerMethodMixin,
  serializeBearerAuth,
  restoreBearerAuth,
  renderBearerAuth,
  clearBearerAuth,
} from './BearerMethodMixin.js';
import {
  NtlmMethodMixin,
  serializeNtlmAuth,
  restoreNtlmAuth,
  renderNtlmAuth,
  clearNtlmAuth,
} from './NtlmMethodMixin.js';
import {
  DigestMethodMixin,
  renderDigestAuth,
  setDigestDefaults,
  serializeDigestAuth,
  restoreDigestAuth,
  clearDigestAuth,
} from './DigestMethodMixin.js';
import {
  Oauth1MethodMixin,
  setOauth1Defaults,
  restoreOauth1Auth,
  serializeOauth1Auth,
  renderOauth1Auth,
  clearOauth1Auth,
  authorizeOauth1,
} from './Oauth1MethodMixin.js';
import {
  Oauth2MethodMixin,
  setOauth2Defaults,
  renderOauth2Auth,
  restoreOauth2Auth,
  serializeOauth2Auth,
  clearOauth2Auth,
  authorizeOauth2,
} from './Oauth2MethodMixin.js';
import { validateForm } from './Validation.js';
import {
  normalizeType,
  METHOD_BASIC,
  METHOD_BEARER,
  METHOD_NTLM,
  METHOD_DIGEST,
  METHOD_OAUTH1,
  METHOD_OAUTH2,
  notifyChange,
  inputHandler,
  selectionHandler,
} from './Utils.js';

export const typeChangedSymbol = Symbol('typeChangedSymbol');

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multiple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from corresponding mixin is called.
 *
 * @extends LitElement
 * @mixes Oauth2MethodMixin
 * @mixes Oauth1MethodMixin
 * @mixes DigestMethodMixin
 * @mixes BasicMethodMixin
 * @mixes NtlmMethodMixin
 * @mixes EventsTargetMixin
 */
export default class AuthorizationMethod extends Oauth2MethodMixin(Oauth1MethodMixin(DigestMethodMixin(NtlmMethodMixin(BearerMethodMixin(BasicMethodMixin(EventsTargetMixin(LitElement))))))) {
  get styles() {
    return authStyles;
  }

  static get properties() {
    return {
      /**
       * Authorization method type.
       *
       * Supported types are (case insensitive, spaces sensitive):
       *
       * - Basic
       * - Client certificate
       * - Digest
       * - NTLM
       * - OAuth 1
       * - OAuth 2
       *
       * Depending on selected type different properties are used.
       * For example Basic type only uses `username` and `password` properties,
       * while NTLM also uses `domain` property.
       *
       * See readme file for detailed list of properties depending on selected type.
       */
      type: { type: String, reflect: true },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set the inputs are disabled
       */
      disabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * Renders mobile friendly view.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Current password.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      password: { type: String },
      /**
       * Current username.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      username: { type: String },
      /**
       * Authorization redirect URI
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      redirectUri: { type: String },
      /**
       * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      accessTokenUri: { type: String },
      /**
       * An URI of authentication endpoint where the user should be redirected
       * to authorize the app. This endpoint initialized OAuth flow.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      authorizationUri: { type: String },
      /**
       * True when currently authorizing the user.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      _authorizing: { type: Boolean },
      /**
       * Oauth 1 or Bearer token (from the oauth console or received from auth server)
       *
       * Used in the following types:
       * - OAuth 1
       * - bearer
       */
      token: { type: String },
      /**
       * List of credentials source
       */
      credentialsSource: { type: Array },
  };
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._type;
    if (old === value) {
      return;
    }
    this._type = value;
    this.requestUpdate('type', old);
    this[typeChangedSymbol](value);
  }

  /**
   * @return {EventListener} Previously registered function or undefined.
   */
  get onchange() {
    return this._onChange;
  }

  /**
   * Registers listener for the `change` event
   * @param {EventListener} value A function to be called when `change` event is
   * dispatched
   */
  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }

  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   *
   * @return {boolean} True when currently authorizing the user.
   */
  get authorizing() {
    return this._authorizing || false;
  }

  constructor() {
    super();
    this._authorizing = false;
    this.password = undefined;
    this.username = undefined;
    this.redirectUri = undefined;
    this.accessTokenUri = undefined;
    this.authorizationUri = undefined;
    this.token = undefined;
    this.readOnly = false;
    this.disabled = false;
    this.compatibility = false;
    this.outlined = false;
    this.narrow = false;
    this.type = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this[typeChangedSymbol](this.type);
  }

  /**
   * A function called when `type` changed.
   * Note, that other properties may not be initialized just yet.
   *
   * @param {String} type Current value.
   */
  [typeChangedSymbol](type) {
    switch (normalizeType(type)) {
      case METHOD_DIGEST:
        return this[setDigestDefaults]();
      case METHOD_OAUTH1:
        return this[setOauth1Defaults]();
      case METHOD_OAUTH2:
        return this[setOauth2Defaults]();
      default:
        return undefined;
    }
  }

  /**
   * Clears settings for current type.
   */
  clear() {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_BASIC:
        this[clearBasicAuth]();
        break;
      case METHOD_BEARER:
        this[clearBearerAuth]();
        break;
      case METHOD_NTLM:
        this[clearNtlmAuth]();
        break;
      case METHOD_DIGEST:
        this[clearDigestAuth]();
        break;
      case METHOD_OAUTH1:
        this[clearOauth1Auth]();
        break;
      case METHOD_OAUTH2:
        this[clearOauth2Auth]();
        break;
      default:
    }
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {Object} User provided data
   */
  serialize() {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_BASIC:
        return this[serializeBasicAuth]();
      case METHOD_BEARER:
        return this[serializeBearerAuth]();
      case METHOD_NTLM:
        return this[serializeNtlmAuth]();
      case METHOD_DIGEST:
        return this[serializeDigestAuth]();
      case METHOD_OAUTH1:
        return this[serializeOauth1Auth]();
      case METHOD_OAUTH2:
        return this[serializeOauth2Auth]();
      default:
        return '';
    }
  }

  /**
   * Validates current method.
   * @return {boolean} Validation state for current authorization method.
   */
  validate() {
    return validateForm(this);
  }

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {any} settings Depends on current type.
   * @return {any}
   */
  restore(settings) {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_BASIC:
        return this[restoreBasicAuth](settings);
      case METHOD_BEARER:
        return this[restoreBearerAuth](settings);
      case METHOD_NTLM:
        return this[restoreNtlmAuth](settings);
      case METHOD_DIGEST:
        return this[restoreDigestAuth](settings);
      case METHOD_OAUTH1:
        return this[restoreOauth1Auth](settings);
      case METHOD_OAUTH2:
        return this[restoreOauth2Auth](settings);
      default:
        return '';
    }
  }

  /**
   * For methods with asynchronous authorization, this functions
   * calls the underlying authorize function and returns the authorization result.
   * 
   * @returns {Promise<any|null>} A promise resolved to the authorization result that depends on the method, or null
   * if the current method does not support async authorization. 
   * @throws {Error} When authorization error.
   */
  async authorize() {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_OAUTH1:
        return this[authorizeOauth1]();
      case METHOD_OAUTH2:
        return this[authorizeOauth2]();
      default:
        return null;
    }
  }

  /**
   * A handler for the `input` event on an input element
   * @param {Event} e Original event dispatched by the input.
   */
  [inputHandler](e) {
    const { name, value } = /** @type HTMLInputElement */ (e.target);
    this[name] = value;
    notifyChange(this);
  }

  [selectionHandler](e) {
    const {
      parentElement,
      selected,
    } = /** @type HTMLOptionElement */ (e.target);
    const { name } = /** @type HTMLInputElement */ (parentElement);
    this[name] = selected;
    notifyChange(this);
  }

  render() {
    const { styles } = this;
    let tpl;
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_BASIC:
        tpl = this[renderBasicAuth]();
        break;
      case METHOD_BEARER:
        tpl = this[renderBearerAuth]();
        break;
      case METHOD_NTLM:
        tpl = this[renderNtlmAuth]();
        break;
      case METHOD_DIGEST:
        tpl = this[renderDigestAuth]();
        break;
      case METHOD_OAUTH1:
        tpl = this[renderOauth1Auth]();
        break;
      case METHOD_OAUTH2:
        tpl = this[renderOauth2Auth]();
        break;
      default:
        tpl = '';
    }
    return html`
      <style>
        ${styles}
      </style>
      ${tpl}
    `;
  }
}
