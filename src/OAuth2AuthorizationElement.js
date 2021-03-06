/* eslint-disable class-methods-use-this */
import { AuthorizationEventTypes } from '@advanced-rest-client/arc-events';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import { OAuth2Authorization } from './OAuth2Authorization.js';

/** @typedef {import('@advanced-rest-client/arc-types').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/arc-events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('./types').ProcessingOptions} ProcessingOptions */

export const authorizeHandler = Symbol('authorizeHandler');

/**
 * An element that utilizes the `OAuth2Authorization` class in a web component.
 * It handles DOM events to perform the authorization.
 */ 
export class OAuth2AuthorizationElement extends EventsTargetMixin(HTMLElement) {
  static get observedAttributes() {
    return ['tokenproxy', 'tokenproxyencode']; 
  }

  constructor() {
    super();
    this[authorizeHandler] = this[authorizeHandler].bind(this);
    /** 
     * When set it uses this value to prefix the call to the 
     * OAuth 2 token endpoint. This is to support use cases when 
     * the requests should be proxied through a server to avoid CORS problems.
     * @type string 
     */
    this.tokenProxy = undefined;
    /**
     * When set it encodes the token URI value before adding it to the 
     * `tokenProxy`. This is to be used when the proxy takes the target 
     * URL as a query parameter.
     * @type boolean 
     */
    this.tokenProxyEncode = undefined;
  }

  /**
   * @param {string} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'tokenproxy': this.tokenProxy = newValue; break;
      case 'tokenproxyencode': this.tokenProxyEncode = newValue !== null; break;
      default:
    }
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    node.addEventListener(AuthorizationEventTypes.OAuth2.authorize, this[authorizeHandler]);
    this.setAttribute('aria-hidden', 'true');
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(AuthorizationEventTypes.OAuth2.authorize, this[authorizeHandler]);
  }

  /**
   * @param {OAuth2AuthorizeEvent} e
   */
  [authorizeHandler](e) {
    const config = { ...e.detail };
    e.detail.result = this.authorize(config);
  }

  /**
   * Authorize the user using provided settings.
   * This is left for compatibility. Use the `OAuth2Authorization` instead.
   *
   * @param {OAuth2Settings} settings The authorization configuration.
   * @returns {Promise<TokenInfo>}
   */
  async authorize(settings) {
    const { tokenProxy, tokenProxyEncode } = this;
    const options = /** @type ProcessingOptions */ ({});
    if (tokenProxy && typeof tokenProxy === 'string') {
      options.tokenProxy = tokenProxy;
    }
    if (tokenProxy && tokenProxyEncode && typeof tokenProxyEncode === 'boolean') {
      options.tokenProxyEncode = tokenProxyEncode;
    }
    const auth = new OAuth2Authorization(settings, options);
    auth.checkConfig();
    return auth.authorize();
  }
}
