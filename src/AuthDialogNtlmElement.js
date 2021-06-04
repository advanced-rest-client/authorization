/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-masked-input.js';
import { AuthDialogElement, inputHandler } from './AuthDialogElement.js';

// @ts-ignore
export default class AuthDialogNtlmElement extends AuthDialogElement {
  static get properties() {
    return {
      /** 
       * User login
       */
      username: { type: String },
      /** 
       * User password
       */
      password: { type: String },
      /** 
       * NT domain to login to.
       */
      domain: { type: String }
    };
  }

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.domain = '';
    
  }

  serialize() {
    return {
      domain: this.domain,
      username: this.username,
      password: this.password
    };
  }

  authFormTemplate() {
    const { password, username, domain, compatibility, outlined } = this;
    return html`
    <anypoint-input
      type="text"
      name="username"
      .value="${username}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">User Name</label>
    </anypoint-input>
    <anypoint-masked-input
      .value="${password}"
      name="password"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">Password</label>
    </anypoint-masked-input>
    <anypoint-input
      type="text"
      .value="${domain}"
      name="domain"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
      >
      <label slot="label">NT domain</label>
    </anypoint-input>
    `;
  }
}
