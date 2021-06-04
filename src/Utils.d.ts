import { Authorization } from '@advanced-rest-client/arc-types';

export const METHOD_OAUTH2: string;
export const METHOD_OAUTH1: string;
export const METHOD_BASIC: string;
export const METHOD_BEARER: string;
export const METHOD_NTLM: string;
export const METHOD_DIGEST: string;
export const CUSTOM_CREDENTIALS: string;

export const selectionHandler: symbol;
export const inputHandler: symbol;

export {normalizeType};


/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 *
 * @returns Normalized value.
 */
declare function normalizeType(type: String): String;

export {notifyChange};


/**
 * Dispatches `change` event on passed `element`
 */
declare function notifyChange(element: HTMLElement): void;

/**
 * Gets credentials from sources if defined
 * @param clientIdValue
 * @param clientSecretValue
 * @param disabled
 * @param credentialsSource
 * @param selectedSource
 * @param grantType
 */
declare function clientCredentials(clientIdValue: String, clientSecretValue: String, disabled: Boolean, credentialsSource: Array<Object>, selectedSource: String, grantType: String): {clientId: String, clientSecret: String, editable: Boolean}

export {clientCredentials};

/**
 * Checks if the URL has valid scheme for OAuth flow.
 *
 * @param url The url value to test
 * @throws {TypeError} When passed value is not set, empty, or not a string
 * @throws {Error} When passed value is not a valid URL for OAuth 2 flow
 */
export function checkUrl(url: string): void;

/**
 * Checks if basic configuration of the OAuth 2 request is valid an can proceed
 * with authentication.
 * @param settings authorization settings
 */
export function sanityCheck(settings: Authorization.OAuth2Authorization): void;

/**
 * Generates a random string of characters.
 *
 * @returns A random string.
 */
export function randomString(): string;

/**
 * Replaces `-` or `_` with camel case.
 * @param name The string to process
 * @return Camel cased string or `undefined` if not transformed.
 */
export function camel(name: string): string|undefined;

/**
 * Computes the SHA256 hash ogf the given input.
 * @param value The value to encode.
 */
export function sha256(value: string): Promise<ArrayBuffer>;

/**
 * Encoded the array buffer to a base64 string value.
 */
export function base64Buffer(buffer: ArrayBuffer): string;

/**
 * Generates code challenge for the PKCE extension to the OAuth2 specification.
 * @param verifier The generated code verifier.
 * @returns The code challenge string
 */
export function generateCodeChallenge(verifier: string): Promise<string>;
