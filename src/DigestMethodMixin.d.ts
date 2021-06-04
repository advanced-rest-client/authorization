export const renderDigestAuth: symbol;
export const setDigestDefaults: symbol;
export const serializeDigestAuth: symbol;
export const restoreDigestAuth: symbol;
export const clearDigestAuth: symbol;

declare function DigestMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & DigestMethodMixinConstructor;
interface DigestMethodMixinConstructor {
  new(...args: any[]): DigestMethodMixin;
}

interface DigestMethodMixin {
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
  requestUrl: string;

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
}

export {DigestMethodMixinConstructor};
export {DigestMethodMixin};
