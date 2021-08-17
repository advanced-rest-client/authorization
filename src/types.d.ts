export declare interface ProcessingOptions {
  /**
   * The number of milliseconds of an interval to check the popup state.
   * Default to 250 ms.
   */
  popupPullTimeout?: number;
  /**
   * The event target on which to listen to the redirect page `message` event.
   * This event should contain a list of authorization parameters returned by the authorization server.
   * 
   * The library contains `oauth-popup.html` page that reads the data from the URL and posts it back to the opener.
   * However, you can create `tokenInfoTranslation` to map returned by the popup parameters to the onces used by the library.
   */
  messageTarget?: EventTarget;
  /**
   * A number of milliseconds after which the iframe triggers a timeout if the response is not present.
   * Defaults to `1020`.
   */
  iframeTimeout?: number;
}

/**
 * The definition of client credentials to be rendered for a given grant type.
 * When set on the editor it renders a drop down where the user can choose from predefined
 * credentials (client id & secret).
 */
declare interface Oauth2Credentials {
  /**
   * The grant type to apply these credentials to.
   */
  grantType: string;
  /**
   * The list of pre-defined credentials to set on the credentials selector.
   */
  credentials: CredentialsInfo[];
}

/**
 * A credentials source definition.
 */
declare interface CredentialsInfo {
  /**
   * The label to render in the drop down list.
   */
  name: string;
  /**
   * The client id to set on the input when selected.
   */
  clientId?: string;
  /**
   * The client secret to set on the input when selected.
   */
  clientSecret?: string;
}
