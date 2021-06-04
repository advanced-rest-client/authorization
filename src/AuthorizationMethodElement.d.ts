import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {BasicMethodMixin} from './BasicMethodMixin';
import {NtlmMethodMixin} from './NtlmMethodMixin';
import {DigestMethodMixin} from './DigestMethodMixin';
import {Oauth1MethodMixin} from './Oauth1MethodMixin';
import {Oauth2MethodMixin} from './Oauth2MethodMixin';
import {BearerMethodMixin} from './BearerMethodMixin';

export const typeChangedSymbol: symbol;

export default interface AuthorizationMethod extends Oauth2MethodMixin, Oauth1MethodMixin, DigestMethodMixin, BearerMethodMixin, BasicMethodMixin, NtlmMethodMixin, EventsTargetMixin, LitElement {
  nonce: string;

  new (): AuthorizationMethod;
  prototype: AuthorizationMethod;
}

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multiple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from corresponding mixin is called.
 * 
 * @fires change When authorization state change
 */
export default class AuthorizationMethod {
  get styles(): CSSResult;

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
   * @attribute
   */
  type: string;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set the inputs are disabled
   * @attribute
   */
  disabled: boolean;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;
  /**
   * Renders mobile friendly view.
   * @attribute
   */
  narrow: boolean;

  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   */
  readonly authorizing: boolean|null;
  _authorizing: boolean|null;
  /**
   * @attribute
   */
  username: string;
  /**
   * @attribute
   */
  password: string;
  /**
   * @attribute
   */
  redirectUri: string;
  /**
   * @attribute
   */
  accessTokenUri: string;
  /**
   * @attribute
   */
  authorizationUri: string;
  /**
   * @attribute
   */
  token: string;
  onchange: EventListener|null;
  /**
   * @attribute List of credentials source
   */
  credentialsSource: Array<CredentialSource>;

  /**
   * Server issued realm for Digest authorization.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  realm: string;

  /**
   * Server issued nonce for Digest authorization.
   *
   * Used in the following types:
   * - Digest
   * - OAuth 1
   * 
   * @attribute
   */
  nonce: string;

  /**
   * The algorithm used to hash the response for Digest authorization.
   *
   * It can be either `MD5` or `MD5-sess`.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  algorithm: string;

  /**
   * The quality of protection value for the digest response.
   * Either '', 'auth' or 'auth-int'
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  qop: string;

  /**
   * Nonce count - increments with each request used with the same nonce
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  nc: number;

  /**
   * Client nonce
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  cnonce: string;

  /**
   * A string of data specified by the server
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  opaque: string;

  /**
   * Hashed response to server challenge
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  response: string;

  /**
   * Request HTTP method
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  httpMethod: string;

  /**
   * Current request URL.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  get requestUrl(): string;
  set requestUrl(value: string);

  _requestUri: string;

  /**
   * Current request body.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  requestBody: string;

  /**
   * Authorization domain
   *
   * Used in the following types:
   * - NTLM
   * @attribute
   */
  domain?: string;


  /**
   * Used by OAuth 1
   * @attribute
   */
  consumerKey: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  consumerSecret: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  tokenSecret: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  timestamp: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  signatureMethod: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  requestTokenUri: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  authTokenMethod: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  authParamsLocation: string;
  /**
   * Used by OAuth 1
   */
  signatureMethods: string[];

  constructor();
  connectedCallback(): void;
  render(): TemplateResult;

  /**
   * Clears settings for current type.
   */
  clear(): void;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): any;

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param settings Depends on current type.
   */
  restore(settings: any): any;

  /**
   * Validates current method.
   */
  validate(): boolean;
  /**
   * For methods with asynchronous authorization, this functions
   * calls the underlying authorize function and returns the authorization result.
   * 
   * @returns A promise resolved to the authorization result that depends on the method, or null
   * if the current method does not support async authorization. 
   * @throws {Error} When authorization error.
   */
  authorize(): Promise<any|null>;
}

declare interface CredentialSource {
  grantType: string
  credentials: Array<Source>
}

declare interface Source {
  name: string
  clientId: string | undefined
  clientSecret: string | undefined
}
