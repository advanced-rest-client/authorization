import { AuthDialogElement } from './AuthDialogElement.js';

/**
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export default class AuthDialogBasicElement extends AuthDialogElement {
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
}
