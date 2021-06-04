import { Authorization } from '@advanced-rest-client/arc-types';
import { TemplateResult } from 'lit-html';

export const setOauth1Defaults: unique symbol;
export const restoreOauth1Auth: unique symbol;
export const serializeOauth1Auth: unique symbol;
export const renderOauth1Auth: unique symbol;
export const clearOauth1Auth: unique symbol;
export const authorizeOauth1: unique symbol;
export const defaultSignatureMethods: string[];
export const oauth1ErrorHandler: unique symbol;
export const oauth1tokenResponseHandler: unique symbol;
export const genTimestamp: unique symbol;
export const timestampHandler: unique symbol;
export const genNonce: unique symbol;
export const nonceHandler: unique symbol;
export const oauth1TokenMethodTemplate: unique symbol;
export const oauth1ParamLocationTemplate: unique symbol;
export const oauth1TimestampTemplate: unique symbol;
export const oauth1NonceTemplate: unique symbol;
export const oauth1SignatureMethodsTemplate: unique symbol;

declare function Oauth1MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & Oauth1MethodMixinConstructor;
interface Oauth1MethodMixinConstructor {
  new(...args: any[]): Oauth1MethodMixin;
}

interface Oauth1MethodMixin {
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
  token: string;
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
   * Server issued nonce for OAuth 1 authorization.
   *
   * Used in the following types:
   * - Digest
   * - OAuth 1
   */
  nonce: string;
  /**
   * Used by OAuth 1
   * @attribute
   */
  realm: string;
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

  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  [setOauth1Defaults](): void;
  /**
   * Clears OAuth 1 auth settings
   */
  [clearOauth1Auth](): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  [serializeOauth1Auth](): Authorization.OAuth1Authorization;

  /**
   * Restores previously serialized authentication values.
   * @param settings Previously serialized values
   */
  [restoreOauth1Auth](settings: Authorization.OAuth1Authorization): void;

  /**
   * Handles OAuth1 authorization errors.
   */
  [oauth1ErrorHandler](): void;

  /**
   * Handler for the `oauth1-token-response` custom event.
   * Sets `token` and `tokenSecret` properties from the event.
   */
  [oauth1tokenResponseHandler](e: CustomEvent): void;

  /**
   * Sets timestamp in seconds
   * @param ignoreChange Ignores change notification when set
   */
  [genTimestamp](ignoreChange: boolean): void;

  [timestampHandler](): void;

  /**
   * Sets auto-generated nonce
   * @param {Boolean} ignoreChange Ignores change notification when set
   */
  [genNonce](ignoreChange: boolean): void;

  [nonceHandler](): void;

  /**
   * Sends the `oauth1-token-requested` event.
   * @return True if event was sent. Can be false if event is not handled or when the form is invalid.
   */
  [authorizeOauth1](): boolean;

  [oauth1TokenMethodTemplate](): TemplateResult;
  [oauth1ParamLocationTemplate](): TemplateResult;
  [oauth1TimestampTemplate](): TemplateResult;
  [oauth1NonceTemplate](): TemplateResult;
  [oauth1SignatureMethodsTemplate](): TemplateResult;
  [renderOauth1Auth](): TemplateResult;

  authorize(): any;
}

export {Oauth1MethodMixinConstructor};
export {Oauth1MethodMixin};
