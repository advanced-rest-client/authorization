import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';
import { inputHandler } from './Utils.js';

/** @typedef {import('./AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.BasicAuthorization} BasicAuthorization */

export const serializeBasicAuth = Symbol('serializeBasicAuth');
export const restoreBasicAuth = Symbol('restoreBasicAuth');
export const renderBasicAuth = Symbol('renderBasicAuth');
export const clearBasicAuth = Symbol('clearBasicAuth');

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class BasicMethodMixinImpl extends base {
    /**
     * Clears basic auth settings
     */
    [clearBasicAuth]() {
      this.password = '';
      this.username = '';
    }

    /**
     * Serialized input values
     * @return {BasicAuthorization} An object with user input
     */
    [serializeBasicAuth]() {
      return {
        password: this.password || '',
        username: this.username || '',
      };
    }

    /**
     * Restores previously serialized Basic authentication values.
     * @param {BasicAuthorization} settings Previously serialized values
     */
    [restoreBasicAuth](settings) {
      this.password = settings.password;
      this.username = settings.username;
    }

    [renderBasicAuth]() {
      const {
        username,
        password,
        outlined,
        compatibility,
        readOnly,
        disabled,
      } = this;
      const uConfig = {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true },
        outlined,
        compatibility,
        readOnly,
        disabled,
      };
      return html` <form autocomplete="on" class="basic-auth">
        ${inputTemplate(
          'username',
          username,
          'User name',
          this[inputHandler],
          uConfig
        )}
        ${passwordTemplate(
          'password',
          password,
          'Password',
          this[inputHandler],
          {
            classes: { block: true },
            outlined,
            compatibility,
            readOnly,
            disabled,
          }
        )}
      </form>`;
    }
  }
  return BasicMethodMixinImpl;
};

/**
 *
 *
 * @mixin
 */
export const BasicMethodMixin = dedupeMixin(mxFunction);
