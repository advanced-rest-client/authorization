import { BearerAuthorization } from "@advanced-rest-client/arc-types/src/authorization/Authorization";
import { TemplateResult } from "lit-html";

export const serializeBearerAuth: unique symbol;
export const restoreBearerAuth: unique symbol;
export const renderBearerAuth: unique symbol;
export const clearBearerAuth: unique symbol;

declare function BearerMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & BearerMethodMixinConstructor;
interface BearerMethodMixinConstructor {
  new(...args: any[]): BearerMethodMixin;
}

interface BearerMethodMixin {
  /**
   * Clears Bearer auth settings
   */
  [clearBearerAuth](): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  [serializeBearerAuth](): BearerAuthorization;

  /**
   * Restores previously serialized Bearer authentication values.
   * @param settings Previously serialized values
   */
  [restoreBearerAuth](settings: BearerAuthorization): void;

  [renderBearerAuth](): TemplateResult;
}

export {BearerMethodMixinConstructor};
export {BearerMethodMixin};
