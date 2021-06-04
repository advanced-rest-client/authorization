import { BasicAuthorization } from "@advanced-rest-client/arc-types/src/authorization/Authorization";
import { TemplateResult } from "lit-html";

export const serializeBasicAuth: unique symbol;
export const restoreBasicAuth: unique symbol;
export const renderBasicAuth: unique symbol;
export const clearBasicAuth: unique symbol;

declare function BasicMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & BasicMethodMixinConstructor;
interface BasicMethodMixinConstructor {
  new(...args: any[]): BasicMethodMixin;
}

interface BasicMethodMixin {
  /**
   * Clears basic auth settings
   */
  [clearBasicAuth](): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  [serializeBasicAuth](): BasicAuthorization;

  /**
   * Restores previously serialized Basic authentication values.
   * @param settings Previously serialized values
   */
  [restoreBasicAuth](settings: BasicAuthorization): void;

  [renderBasicAuth](): TemplateResult;
}

export {BasicMethodMixinConstructor};
export {BasicMethodMixin};
