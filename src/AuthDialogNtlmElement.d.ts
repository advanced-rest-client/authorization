import { AuthDialogElement } from './AuthDialogElement.js';

/**
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export default class AuthDialogNtlmElement extends AuthDialogElement {
  /** 
   * User login
   * @attribute
   */
  username: string;
  /** 
   * User password
   * @attribute
   */
  password: string;
  /** 
   * NT domain to login to.
   * @attribute
   */
  domain: string;
}
