import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { notifyChange, selectionHandler, inputHandler } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';

/* eslint-disable no-plusplus */

/** @typedef {import('./AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@advanced-rest-client/arc-types/src/authorization/Authorization').DigestAuthorization} DigestAuthorization */

export const renderDigestAuth = Symbol('renderDigestAuth');
export const setDigestDefaults = Symbol('setDigestDefaults');
export const serializeDigestAuth = Symbol('serializeDigestAuth');
export const restoreDigestAuth = Symbol('restoreDigestAuth');
export const clearDigestAuth = Symbol('clearDigestAuth');
const _generateDigestResponse = Symbol('_generateDigestResponse');
const _getHA1 = Symbol('_getHA1');
const _getHA2 = Symbol('_getHA2');
const _qopTemplate = Symbol('_qopTemplate');
const _processRequestUrl = Symbol('_processRequestUrl');
const _hashAlgorithmTemplate = Symbol('_hashAlgorithmTemplate');

/**
 * Generates client nonce for Digest authorization.
 *
 * @return {string} Generated client nonce.
 */
const generateCnonce = () => {
  const characters = 'abcdef0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    const randNum = Math.round(Math.random() * characters.length);
    token += characters.substr(randNum, 1);
  }
  return token;
};

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class DigestMethodMixinImpl extends base {
    static get properties() {
      return {
        /**
         * Server issued realm for Digest authorization.
         *
         * Used in the following types:
         * - Digest
         */
        realm: { type: String },
        /**
         * Server issued nonce for Digest authorization.
         *
         * Used in the following types:
         * - Digest
         */
        nonce: { type: String },
        /**
         * The algorithm used to hash the response for Digest authorization.
         *
         * It can be either `MD5` or `MD5-sess`.
         *
         * Used in the following types:
         * - Digest
         */
        algorithm: { type: String },
        /**
         * The quality of protection value for the digest response.
         * Either '', 'auth' or 'auth-int'
         *
         * Used in the following types:
         * - Digest
         */
        qop: { type: String },
        /**
         * Nonce count - increments with each request used with the same nonce
         *
         * Used in the following types:
         * - Digest
         */
        nc: { type: Number },
        /**
         * Client nonce
         *
         * Used in the following types:
         * - Digest
         */
        cnonce: { type: String },
        /**
         * A string of data specified by the server
         *
         * Used in the following types:
         * - Digest
         */
        opaque: { type: String },
        /**
         * Hashed response to server challenge
         *
         * Used in the following types:
         * - Digest
         */
        response: { type: String },
        /**
         * Request HTTP method
         *
         * Used in the following types:
         * - Digest
         */
        httpMethod: { type: String },
        /**
         * Current request URL.
         *
         * Used in the following types:
         * - Digest
         */
        requestUrl: { type: String },

        _requestUri: { type: String },
        /**
         * Current request body.
         *
         * Used in the following types:
         * - Digest
         */
        requestBody: { type: String },
      };
    }

    get requestUrl() {
      return this._requestUrl;
    }

    set requestUrl(value) {
      const old = this._requestUrl;
      /* istanbul ignore if */
      if (old === value) {
        return;
      }
      this._requestUrl = value;
      this[_processRequestUrl](value);
    }

    constructor() {
      super();
      /**
       * @type {string}
       */
      this.httpMethod = undefined;
    }

    [_processRequestUrl](value) {
      if (!value || typeof value !== 'string') {
        this._requestUri = undefined;
        notifyChange(this);
        return;
      }
      let result;
      try {
        const url = new URL(value);
        result = url.pathname;
      } catch (_) {
        result = value.trim();
      }
      this._requestUri = result;
      notifyChange(this);
    }

    [setDigestDefaults]() {
      if (!this.nc) {
        this.nc = 1;
      }
      if (!this.algorithm) {
        this.algorithm = 'MD5';
      }
      if (!this.cnonce) {
        this.cnonce = generateCnonce();
      }
    }

    /**
     * Clears Digest auth settings
     */
    [clearDigestAuth]() {
      this.password = '';
      this.username = '';
      this.realm = '';
      this.nonce = '';
      this.opaque = '';
      this.qop = '';
      this.cnonce = '';
      this.algorithm = '';
      this.nc = undefined;
      this.response = '';
      this[setDigestDefaults]();
      // url, method, and body should not be controlled by this
      // component.
    }

    /**
     * Restores previously serialized Digest authentication values.
     * @param {DigestAuthorization} settings Previously serialized values
     */
    [restoreDigestAuth](settings) {
      this.username = settings.username;
      this.password = settings.password;
      this.realm = settings.realm;
      this.nonce = settings.nonce;
      this.opaque = settings.opaque;
      this.qop = settings.qop;
      this.cnonce = settings.cnonce;
      this.algorithm = settings.algorithm;
      if (settings.uri) {
        this._requestUri = settings.uri;
      }
      if (settings.nc) {
        this.nc = Number(String(settings.nc).replace(/0+/, ''));
      }
    }

    /**
     * Serialized input values
     * @return {DigestAuthorization} An object with user input
     */
    [serializeDigestAuth]() {
      this.response = this[_generateDigestResponse]();
      const settings = {
        username: this.username || '',
        password: this.password || '',
        realm: this.realm,
        nonce: this.nonce,
        uri: this._requestUri,
        response: this.response,
        opaque: this.opaque,
        qop: this.qop,
        nc: `00000000${this.nc}`.slice(-8),
        cnonce: this.cnonce,
        algorithm: this.algorithm,
      };
      return settings;
    }

    /**
     * Generates the response header based on the parameters provided in the
     * form.
     *
     * See https://en.wikipedia.org/wiki/Digest_access_authentication#Overview
     *
     * @return {string} A response part of the authenticated digest request.
     */
    [_generateDigestResponse]() {
      /* global CryptoJS */
      const HA1 = this[_getHA1]();
      const HA2 = this[_getHA2]();
      const ncString = `00000000${this.nc}`.slice(-8);
      let responseStr = `${HA1}:${this.nonce}`;
      if (!this.qop) {
        responseStr += `:${HA2}`;
      } else {
        responseStr += `:${ncString}:${this.cnonce}:${this.qop}:${HA2}`;
      }
      // @ts-ignore
      return CryptoJS.MD5(responseStr).toString();
    }

    // Generates HA1 as defined in Digest spec.
    [_getHA1]() {
      const { username, realm, password } = this;
      let HA1param = `${username}:${realm}:${password}`;
      // @ts-ignore
      let HA1 = CryptoJS.MD5(HA1param).toString();
      if (this.algorithm === 'MD5-sess') {
        const { nonce, cnonce } = this;
        HA1param = `${HA1}:${nonce}:${cnonce}`;
        // @ts-ignore
        HA1 = CryptoJS.MD5(HA1param).toString();
      }
      return HA1;
    }

    // Generates HA2 as defined in Digest spec.
    [_getHA2]() {
      const { httpMethod, _requestUri } = this;
      let HA2param = `${httpMethod}:${_requestUri}`;
      if (this.qop === 'auth-int') {
        // @ts-ignore
        const v = CryptoJS.MD5(this.requestBody).toString();
        HA2param += `:${v}`;
      }
      // @ts-ignore
      return CryptoJS.MD5(HA2param).toString();
    }

    [_qopTemplate]() {
      const { outlined, compatibility, readOnly, disabled, qop } = this;
      return html`
      <anypoint-dropdown-menu
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        ?disabled="${disabled||readOnly}"
        name="qop"
      >
        <label slot="label">Quality of protection</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${qop}"
          @selected-changed="${this[selectionHandler]}"
          ?compatibility="${compatibility}"
          ?disabled="${disabled||readOnly}"
          attrforselected="data-qop"
        >
          <anypoint-item ?compatibility="${compatibility}" data-qop="auth"
            >auth</anypoint-item
          >
          <anypoint-item ?compatibility="${compatibility}" data-qop="auth-int"
            >auth-int</anypoint-item
          >
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    [_hashAlgorithmTemplate]() {
      const { outlined, compatibility, readOnly, disabled, algorithm } = this;
      return html`
      <anypoint-dropdown-menu
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        ?disabled="${disabled||readOnly}"
        name="algorithm"
      >
        <label slot="label">Hash algorithm</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${algorithm}"
          @selected-changed="${this[selectionHandler]}"
          ?compatibility="${compatibility}"
          ?disabled="${disabled||readOnly}"
          attrforselected="data-algorithm"
        >
          <anypoint-item ?compatibility="${compatibility}" data-algorithm="MD5"
            >MD5</anypoint-item
          >
          <anypoint-item
            ?compatibility="${compatibility}"
            data-algorithm="MD5-sess"
            >MD5-sess</anypoint-item
          >
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    [renderDigestAuth]() {
      const {
        username,
        password,
        realm,
        nonce,
        nc,
        opaque,
        cnonce,
        outlined,
        compatibility,
        readOnly,
        disabled,
      } = this;
      return html`
      <form autocomplete="on" class="digest-auth">
        ${inputTemplate('username', username, 'User name', this[inputHandler], {
          required: true,
          autoValidate: true,
          invalidLabel: 'Username is required',
          classes: { block: true },
          outlined,
          compatibility,
          readOnly,
          disabled,
        })}
        ${passwordTemplate(
          'password',
          password,
          'Password',
          this[inputHandler],
          {
            classes: { block: true },
            outlined,
            compatibility,
            readOnly,
            disabled,
          }
        )}
        ${inputTemplate(
          'realm',
          realm,
          'Server issued realm',
          this[inputHandler],
          {
            required: true,
            autoValidate: true,
            invalidLabel: 'Realm is required',
            classes: { block: true },
            outlined,
            compatibility,
            readOnly,
            disabled,
          }
        )}
        ${inputTemplate(
          'nonce',
          nonce,
          'Server issued nonce',
          this[inputHandler],
          {
            required: true,
            autoValidate: true,
            invalidLabel: 'Nonce is required',
            classes: { block: true },
            outlined,
            compatibility,
            readOnly,
            disabled,
          }
        )}
        ${this[_qopTemplate]()}
        ${inputTemplate('nc', nc, 'Nonce count', this[inputHandler], {
          required: true,
          autoValidate: true,
          invalidLabel: 'Nonce count is required',
          classes: { block: true },
          type: 'number',
          outlined,
          compatibility,
          readOnly,
          disabled,
        })}
        ${this[_hashAlgorithmTemplate]()}
        ${inputTemplate(
          'opaque',
          opaque,
          'Server issued opaque string',
          this[inputHandler],
          {
            required: true,
            autoValidate: true,
            invalidLabel: 'Server issued opaque is required',
            classes: { block: true },
            outlined,
            compatibility,
            readOnly,
            disabled,
          }
        )}
        ${inputTemplate('cnonce', cnonce, 'Client nonce', this[inputHandler], {
          required: true,
          autoValidate: true,
          invalidLabel: 'Client nonce is required',
          classes: { block: true },
          outlined,
          compatibility,
          readOnly,
          disabled,
        })}
      </form>`;
    }
  }
  return DigestMethodMixinImpl;
};

/**
 * A mixin that adds support for Digest method computations.
 *
 * @mixin
 */
export const DigestMethodMixin = dedupeMixin(mxFunction);
