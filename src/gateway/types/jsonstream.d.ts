declare module "JSONStream" {
  import { Transform } from "stream";

  /**
   * Parses a JSON stream and emits matching nodes.
   * Example: JSONStream.parse<User>("*") → event will be typed as User.
   */
  export function parse<T = any>(pattern?: string | string[]): Transform & {
    on(event: "data", listener: (data: T) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "end", listener: () => void): this;
  };

  /**
   * Stringifies a stream of values into valid JSON.
   * Example: JSONStream.stringify<User>() will accept objects of type User.
   */
  export function stringify<T = any>(
    open?: string,
    sep?: string,
    close?: string
  ): Transform & {
    write(data: T): boolean;
    end(data?: T): void;
  };

  /**
   * Stringifies key-value pairs into valid JSON.
   * Example: JSONStream.stringifyObject<[string, User]>().
   */
  export function stringifyObject<T = any>(
    open?: string,
    sep?: string,
    close?: string
  ): Transform & {
    write(data: [string, T]): boolean;
    end(data?: [string, T]): void;
  };

  const _default: {
    parse: typeof parse;
    stringify: typeof stringify;
    stringifyObject: typeof stringifyObject;
  };

  export default _default;
}