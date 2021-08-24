import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '../oauth2-authorization.js';
import '../authorization-method.js';
import env from './env.js';

console.log(env);

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'compatibility',
      'outlined',
      'openIdChangesCounter',
      'oauth2BaseUriEnabled',
      'credentialsSource',
      'allowRedirectUriChange',
      'issuerUri',
    ]);
    this.componentName = 'authorization-method';
    this.darkThemeActive = false;
    this.oauth2BaseUriEnabled = false;
    this.allowRedirectUriChange = false;
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.openIdChangesCounter = 0;
    // this.oauth2redirect = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2redirect = `${window.location.origin}/oauth-popup.html`;
    this.credentialsSource = [{grantType: 'client_credentials', credentials: [{name: 'My social Network', clientId: '123', clientSecret: 'xyz'}, {name: 'My social Network 2', clientId: '1234', clientSecret: 'wxyz'}]}];
    this.issuerUri = 'https://accounts.google.com/';
    // this.issuerUri = env.oauth2.issuer;
    this.issuers = [
      env.oauth2.issuer,
      'https://accounts.google.com/',
      'https://login.salesforce.com/',
      'https://phantauth.net/',
      'https://www.paypalobjects.com/',
      'https://api.login.yahoo.com/',
      'https://login.microsoftonline.com/fabrikamb2c.onmicrosoft.com/v2.0/'
    ];
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _openIdChangeHandler(e) {
    this.openIdChangesCounter++;
    const result = e.target.serialize();
    console.log(result);
  }

  /**
   * @param {Event} e
   */
  _issuerHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    this.issuerUri = input.value;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      demoState,
      openIdChangesCounter,
      oauth2redirect,
      oauth2BaseUriEnabled,
      credentialsSource,
      allowRedirectUriChange,
      issuerUri,
      issuers,
    } = this;
    const baseUri = oauth2BaseUriEnabled ? 'https://api.domain.com/auth/' : undefined;
    return html`
    <section class="documentation-section">
      <h3>OpenID connect authentication</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <authorization-method
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
          type="open id"
          slot="content"
          redirectUri="${oauth2redirect}"
          clientId="1076318174169-5i48tqquddrk0lv0shbtsaj6kc8c9j5g.apps.googleusercontent.com"
          clientSecret="SF3kI7tqI_BUdc5ACkJ4vjII"
          grantType="authorization_code"
          issuerUrl="${issuerUri}"
          ?allowRedirectUriChange="${allowRedirectUriChange}"
          .credentialsSource="${credentialsSource}"
          .baseUri="${baseUri}"
          @change="${this._openIdChangeHandler}"
        ></authorization-method>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="oauth2BaseUriEnabled"
          @change="${this._toggleMainOption}">Add base URI</anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowRedirectUriChange"
          @change="${this._toggleMainOption}">Allow redirect URI change</anypoint-checkbox>
      </arc-interactive-demo>

      <div>
        <label for="issuer-uri">Issuer URI:</label>
        <select id="issuer-uri" name="issuer-uri" @change="${this._issuerHandler}" @blur="${this._issuerHandler}">
          ${issuers.map(uri => html`<option ?selected="${uri === issuerUri}" value="${uri}">${uri}</option>`)}
        </select>
      </div>
      
      <p>Change events counter: ${openIdChangesCounter}</p>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <oauth2-authorization tokenProxy="${env.oauth2.tokenProxy}" tokenProxyEncode=''></oauth2-authorization>
      <h2>Authorization method</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();