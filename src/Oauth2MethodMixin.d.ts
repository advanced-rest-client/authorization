import { TokenInfo, OAuth2Authorization, OAuth2DeliveryMethod } from "@advanced-rest-client/arc-types/src/authorization/Authorization";
import { TemplateResult } from "lit-html";
import { CredentialsInfo, Oauth2Credentials } from "./types";
export declare interface GrantType {
  type: string;
  label: string;
}

export const clickCopyAction: unique symbol;
export const scopesChanged: unique symbol;
export const oauth2RedirectTemplate: unique symbol;
export const oauth2GrantTypeTemplate: unique symbol;
export const oauth2AdvancedTemplate: unique symbol;
export const oath2AuthorizeTemplate: unique symbol;
export const oauth2TokenTemplate: unique symbol;
export const advHandler: unique symbol;
export const readUrlValue: unique symbol;
export const setOauth2Defaults: unique symbol;
export const authorizeOauth2: unique symbol;
export const renderOauth2Auth: unique symbol;
export const credentialsSourceTemplate: unique symbol;
export const restoreOauth2Auth: unique symbol;
export const serializeOauth2Auth: unique symbol;
export const oauth2CustomPropertiesTemplate: unique symbol;
export const autoHide: unique symbol;
export const clearOauth2Auth: unique symbol;
export const clientIdTemplate: unique symbol;
export const clientSecretTemplate: unique symbol;
export const toggleAdvViewSwitchTemplate: unique symbol;
export const authorizationUriTemplate: unique symbol;
export const accessTokenUriTemplate: unique symbol;
export const usernameTemplate: unique symbol;
export const passwordTemplateLocal: unique symbol;
export const scopesTemplate: unique symbol;
export const pkceTemplate: unique symbol;
export const pkceChangeHandler: unique symbol;
export const paramsLocationTemplate: unique symbol;
export const grantTypeSelectionHandler: unique symbol;
export const editRedirectUriTemplate: unique symbol;
export const editRedirectUriHandler: unique symbol;
export const editingRedirectUri: unique symbol;
export const redirectUriContentTemplate: unique symbol;
export const redirectUriInputTemplate: unique symbol;
export const redirectInputBlur: unique symbol;
export const redirectInputKeydown: unique symbol;
export const commitRedirectUri: unique symbol;
export const cancelRedirectUri: unique symbol;
export const credentialSourceHandler: unique symbol;
export const updateClientCredentials: unique symbol;
export const updateCredentials: unique symbol;
export const listCredentials: unique symbol;
export const isSourceSelected: unique symbol;

export const oauth2GrantTypes: GrantType[];

declare function Oauth2MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & Oauth2MethodMixinConstructor;
interface Oauth2MethodMixinConstructor {
  new(...args: any[]): Oauth2MethodMixin;
}

interface Oauth2MethodMixin {
  readonly isCustomGrantType: boolean;
  readonly clientIdRequired: boolean;
  readonly oauth2ClientSecretRendered: boolean;
  readonly oauth2AuthorizationUriRendered: boolean;
  readonly oauth2AccessTokenUriRendered: boolean;
  readonly oauth2PasswordRendered: boolean;
  /** 
   * Selected authorization grand type.
   * @attribute
   */
  grantType: string;
  /** 
   * The client ID for the auth token.
   * @attribute
   */
  clientId: string;
  /** 
   * The client secret. It to be used when selected server flow.
   * @attribute
   */
  clientSecret: string;
  /**
   * List of user selected scopes.
   * It can be pre-populated with list of scopes (array of strings).
   */
  scopes: string[];
  /**
   * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
   * element.
   */
  allowedScopes: string[];
  /**
   * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
   * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
   * @attribute
   */
  preventCustomScopes: boolean;
  /**
   * When the user authorized the app it should be set to the token value.
   * This element do not perform authorization. Other elements must intercept
   * the token request event and perform the authorization.
   * @attribute
   */
  accessToken: string;
  /**
   * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
   * If the token response contains `tokenType` property then this value is updated.
   * @attribute
   */
  tokenType?: string;
  /**
   * Currently available response types.
   */
  grantTypes?: GrantType[];
  /**
   * If set it renders authorization url, token url and scopes as advanced options
   * which are then invisible by default. User can oen setting using the UI.
   * @attribute
   */
  advanced?: boolean;
  /**
   * If true then the advanced options are opened.
   * @attribute
   */
  advancedOpened?: boolean;
  /**
   * If set, the response type selector is hidden from the UI.
   * @attribute
   */
  noGrantType?: boolean;
  /**
   * Informs about what filed of the authenticated request the token property should be set.
   * By default the value is `header` which corresponds to the `authorization` by default,
   * but it is configured by the `deliveryName` property.
   * 
   * This can be used by the AMF model when the API spec defines where the access token should be
   * put in the authenticated request.
   * 
   * @default header
   * @attribute
   */
  oauthDeliveryMethod?: OAuth2DeliveryMethod;
  /** 
   * The client credentials delivery method.
   * @default body
   */
  ccDeliveryMethod?: string;
  /**
   * The name of the authenticated request property that carries the token.
   * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
   * 
   * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
   * where to put the authorization token.
   * 
   * @default authorization
   * @attribute
   */
  oauthDeliveryName?: string;
  /**
   * The base URI to use to construct the correct URLs to the authorization endpoints.
   * 
   * When the paths are relative then base URI is added to the path.
   * Relative paths must start with '/'.
   * 
   * Note, URL processing is happening internally in the component. The produced authorize event
   * will have base URI already applied.
   * @attribute
   */
  baseUri?: string;
  /**
   * The error message returned by the authorization library.
   * It renders error dialog when an error ocurred. 
   * It is automatically cleared when the user request the token again.
   */
  lastErrorMessage?: string;
  /** 
   * When this property is set then the PKCE option is not rendered for the 
   * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
   * to keep this control disabled and override generated settings when the API spec
   * says that the PKCE is supported.
   * @attribute
   */
  noPkce?: boolean;
  /** 
   * Whether or not the PKCE extension is enabled for this authorization configuration.
   * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
   * @attribute
   */
  pkce: boolean;
  /**
   * The definition of client credentials to be rendered for a given grant type.
   * When set on the editor it renders a drop down where the user can choose from predefined
   * credentials (client id & secret).
   */
  credentialsSource: Array<Oauth2Credentials>;
  /**
   * The currently selected source in the client credentials dropdown.
   * @attribute 
   */
  credentialSource: string;
  /**
   * @attribute 
   */
  credentialsDisabled: boolean;
  /** 
   * When set it allows to edit the redirect URI by the user.
   * @attribute
   */
  allowRedirectUriChange: boolean;

  /**
   * Restores previously serialized values
   * @param settings
   */
  [restoreOauth2Auth](settings: OAuth2Authorization): void;

  /**
   * Serializes OAuth2 parameters into a configuration object.
   */
  [serializeOauth2Auth](): OAuth2Authorization;

  /**
   * When defined and the `url` is a relative path staring with `/` then it
   * adds base URI to the path and returns concatenated value.
   *
   * @return The final URL value.
   */
  [readUrlValue](url: string): string;

  [setOauth2Defaults](): void;

  /**
   * Clears OAuth 1 auth settings
   */
  [clearOauth2Auth](): void;

  /**
   * Performs the authorization.
   * 
   * @returns The auth token or null if couldn't be requested.
   * @throws {Error} When authorization error
   */
  [authorizeOauth2](): Promise<TokenInfo | null>;

  /**
   * Generates `state` parameter for the OAuth2 call.
   *
   * @return {string} Generated state string.
   */
  generateState(): string;

  /**
   * This function hides all non-crucial fields that has been pre-filled when element has been
   * initialize (values not provided by the user). Hidden fields will be available under
   * "advanced" options.
   *
   * To prevent this behavior set `no-auto` attribute on this element.
   */
  [autoHide](): void;

  /**
   * A handler for `focus` event on a label that contains text and
   * should be copied to clipboard when user is interacting with it.
   */
  [clickCopyAction](e: MouseEvent): void;

  /**
   * Event handler for the scopes element changed state
   */
  [scopesChanged](e: CustomEvent): void;

  [advHandler](e: CustomEvent): void;
  /**
   * The handler for the change event coming from the PKCE input checkbox
   */
  [pkceChangeHandler](e: Event): void;

  /**
   * A handler for the edit redirect URI button click.
   * Sets the editing flag and requests the update.
   */
  [editRedirectUriHandler](): Promise<void>

  /**
   * Commits the redirect URI editor value on enter key or cancels on escape.
   */
  [redirectInputKeydown](e: KeyboardEvent): void;

  /**
   * Commits the redirect URI editor value on input blur.
   */
  [redirectInputBlur](e: Event): void;

  /**
   * Sets the new redirect URI if the value passes validation.
   * This closes the editor.
   * @param value The new value to set.
   */
  [commitRedirectUri](value: string): void;

  /**
   * Resets the redirect URI edit flag and requests an update.
   */
  [cancelRedirectUri](): void;

  /**
   * @returns The list of client credentials to render in the credentials selector.
   */
  [listCredentials](): CredentialsInfo[];

  /**
   * Sets the client credentials after updating them from the credentials source selector.
   * @param clientId The client id to set on the editor.
   * @param clientSecret The client secret to set on the editor.
   * @param disabled Whether the credentials input is disabled.
   */
  [updateCredentials](clientId: string, clientSecret: string, disabled: boolean): void;

  /**
   * This triggers change in the client id & secret of the editor after selecting 
   * a credentials source by the user.
   * 
   * @param selectedSource The name of the selected credentials source to select.
   */
  [updateClientCredentials](selectedSource: string): void;
  [grantTypeSelectionHandler](e: Event): void;
  [credentialSourceHandler](e: Event): void;

  /**
   * @returns true when a credentials source is being selected.
   */
  [isSourceSelected](): boolean;

  /**
   * @returns The template for the OAuth 2 redirect URI label
   */
  [oauth2RedirectTemplate](): TemplateResult;

  /**
     * @returns The template for the OAuth 2 redirect URI content
     */
  [redirectUriContentTemplate](): TemplateResult;

  /**
   * @returns The template for the OAuth 2 redirect URI input
   */
  [redirectUriInputTemplate](): TemplateResult;

  /**
   * @return The template for the edit redirect URI button, when enabled.
   */
  [editRedirectUriTemplate](): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 response type selector
   */
  [oauth2GrantTypeTemplate](): TemplateResult;

  /**
   * @returns The template for the OAuth 2 advanced options.
   */
  [oauth2AdvancedTemplate](): TemplateResult;

  /**
   * @returns The template for the "authorize" button.
   */
  [oath2AuthorizeTemplate](): TemplateResult;

  /**
   * @returns The template for the OAuth 2 token value
   */
  [oauth2TokenTemplate](): TemplateResult;

  /**
   * @return The template for the client credentials source.
   */
  [credentialsSourceTemplate](): TemplateResult|string;

  /**
   * @returns The template for the OAuth 2 editor.
   */
  [renderOauth2Auth](): TemplateResult;

  [oauth2CustomPropertiesTemplate](): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 client secret input.
   */
  [clientSecretTemplate](): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 client id input.
   */
  [clientIdTemplate](): TemplateResult;

  /**
   * @returns The template for the toggle advanced view switch
   */
  [toggleAdvViewSwitchTemplate](): TemplateResult | string;

  /**
   * @param urlType The input type to render
   * @returns The template for the authorization URI input
   */
  [authorizationUriTemplate](urlType: string): TemplateResult | string;

  /**
   * @param urlType The input type to render
   * @returns The template for the access token URI input
   */
  [accessTokenUriTemplate](urlType: string): TemplateResult | string;

  /**
   * @returns The template for the user name input
   */
  [usernameTemplate](): TemplateResult | string;

  /**
   * @returns The template for the user password input
   */
  [passwordTemplateLocal](): TemplateResult | string;

  /**
   * @returns The template for the OAuth 2 scopes input
   */
  [scopesTemplate](): TemplateResult;
  /**
    * @returns The template for the PKCE option of the OAuth 2 extension.
    */
  [pkceTemplate](): TemplateResult | string;

  /**
   * For client_credentials grant this renders the dropdown with an option to select
   * where the credentials should be used. Current values: 
   * - authorization header
   * - message body
   */
  [paramsLocationTemplate](): TemplateResult | string;
}

export { Oauth2MethodMixinConstructor };
export { Oauth2MethodMixin };
