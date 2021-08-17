# Authorization

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/authorization.svg)](https://www.npmjs.com/package/@advanced-rest-client/authorization)

[![tests](https://github.com/advanced-rest-client/authorization/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/authorization/actions/workflows/deployment.yml)

The UI and logic related to HTTP authorization.

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/authorization
```

### Components

#### authorization-selector

An element that utilizes the `authorization-method` to render a selection box of authorization methods.

```html
<authorization-selector
  horizontal
  multi
>
  <!-- None option -->
  <div type="none" aria-describedby="noneDesc">Authorization configuration is disabled</div>
  <p id="noneDesc" slot="aria">Select authorization method required by the API.</p>

  <!-- HTTP basic authorization -->
  <authorization-method type="basic" aria-describedby="basicDesc"></authorization-method>
  <p id="basicDesc" slot="aria">
    Basic authorization allows to send a username and a password in a request header.
  </p>

  <!-- Bearer token authorization -->
  <authorization-method type="bearer" aria-describedby="tokenDesc"></authorization-method>
  <p id="tokenDesc" slot="aria">
    Bearer authorization allows to send an authentication token in the authorization header using the "bearer" method.
  </p>

  <!-- ... -->
</authorization-selector>
```

#### authorization-method

The `authorization-method` element renders a form with inputs related to an authorization scheme defined by the `type` property.

```html
<authorization-method
  type="oauth 2"
  redirectUri="https://..."
  authorizationUri="https://..."
  accessTokenUri="https://..."
  clientId="test-client-id"
  grantType="authorization_code"
  pkce
></authorization-method>
```

#### oauth2-scope-selector

An input that specializes in selecting an OAuth 2 scope.

```html
 <oauth2-scope-selector
  required
  autoValidate
  allowedScopes='["user", "user:email", "user:follow", "..."]'
></oauth2-scope-selector>
```

### OAuth authorization

```javascript
import { OAuth2Authorization } from '@advanced-rest-client/oauth-authorization';

const settings = {
  grantType: 'implicit',
  clientId: 'CLIENT ID',
  redirectUri: 'https://example.com/auth-popup.html',
  authorizationUri: 'https://auth.example.com/token',
  scopes: ['email'],
  state: 'Optional string',
};

const factory = new OAuth2Authorization(settings);
const tokenInfo = await factory.authorize(settings)
```

#### Popup in authorization flow

This package contains the `oauth-popup.html` that can be used to exchange token / code data with hosting page. Other page can be used as well.
The popup page must use the `window.postMessage()` to report back to the library the parameters returned by the authorization server. It expect to return the part of the URL that contains the authorization result.
For example, for the popup url having values like this: `https://redirect.domain.com/popup.html#code=1234&state=5678` the popup window should post message with `code=1234&state=5678`.

#### The state parameter and security

This element is intend to be used in debug applications where confidentially is already compromised because users may be asked to provide client secret parameter (depending on the flow).
**It should not be used in client applications** that don't serve debugging purposes. Client secret should never be used on the client side.

To have at least minimum of protection (in already compromised environment) this library generates a `state` parameter as a series of alphanumeric characters and append them to the request.
It is expected to return the same string in the response (as defined in rfc6749). Though this parameter is optional, it will reject the response if the `state` parameter is not the same as the one generated before the request.

The state parameter is generated automatically by the element if non provided in settings. It is a good idea to use this property to check if the event response (either token or error) are coming from your request for token. The app can
support different OAuth clients so you can check later with the token response if this is a response for the same client.

#### Non-interactive authorization

For `implicit` and `authorization_code` token requests you can set the `interactive` configuration property to `false` to request the token in the background without rendering any UI related to authorization to the user.
It can be used to request an access token after the user authorized the application. Server should return the token which will be passed back to the application.

#### Pre-defined client credentials

For user convenience in a test environment (like testing or documentation tools) we can define a list of client credentials (client id and client secret) that are rendered in the OAuth 2 editor in a drop down selector.
This way a user can choose to use one of these credentials instead providing them manually.

```javascript
const credentialsSource = [{
  grantType: 'client_credentials', 
  credentials: [
    {
      name: 'My social Network', 
      clientId: '123', 
      clientSecret: 'xyz'
    }, {
      name: 'My social Network 2', 
      clientId: '9876', 
      clientSecret: 'abc'
    }
  ]
}];
const editor = document.querySelector('authorization-method[oauth 2]');
editor.credentialsSource = credentialsSource;
```

## Development

```sh
git clone https://github.com/advanced-rest-client/authorization
cd authorization
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## Acknowledgements

- This element uses [jsrsasign](https://github.com/kjur/jsrsasign) library distributed under MIT licence.
- This element uses [crypto-js](https://code.google.com/archive/p/crypto-js/) library distributed under BSD license.

## Required dependencies

The `CryptoJS` and `RSAKey` libraries are not included into the element sources.
If your project do not use this libraries already include it into your project.

```sh
npm i cryptojslib jsrsasign
```

```html
<script src="../../../cryptojslib/components/core.js"></script>
<script src="../../../cryptojslib/rollups/sha1.js"></script>
<script src="../../../cryptojslib/components/enc-base64-min.js"></script>
<script src="../../../cryptojslib/rollups/md5.js"></script>
<script src="../../../cryptojslib/rollups/hmac-sha1.js"></script>
<script src="../../../jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```

Also OAuth1 element uses `URL` class with `searchParams` properties. If targeting old browsers include polyfill for this too.
