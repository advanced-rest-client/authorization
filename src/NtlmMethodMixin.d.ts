import { NtlmAuthorization } from "@advanced-rest-client/arc-types/src/authorization/Authorization";
import { TemplateResult } from "lit-html";

export const serializeNtlmAuth: unique symbol;
export const restoreNtlmAuth: unique symbol;
export const renderNtlmAuth: unique symbol;
export const clearNtlmAuth: unique symbol;

declare function NtlmMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & NtlmMethodMixinConstructor;
interface NtlmMethodMixinConstructor {
  new(...args: any[]): NtlmMethodMixin;
}

interface NtlmMethodMixin {
  /**
   * Authorization domain
   *
   * Used in the following types:
   * - NTLM
   * @attribute
   */
  domain?: string;

  /**
   * Clears NTLM auth settings
   */
  [clearNtlmAuth](): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  [serializeNtlmAuth](): NtlmAuthorization;

  /**
   * Restores previously serialized NTLM authentication values.
   * @param settings Previously serialized values
   */
  [restoreNtlmAuth](settings: NtlmAuthorization): void;

  [renderNtlmAuth](): TemplateResult;
}

export {NtlmMethodMixinConstructor};
export {NtlmMethodMixin};
