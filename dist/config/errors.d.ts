/**
* Errors raised by this package when loading configurations.
* @internal
**/
export declare class ConfigError extends Error {
    /** Configuration error.
      * @param {string} message - Error message. */
    constructor(message: string);
}
/**
* Error raised when deserialization fails.
* @internal
**/
export declare class MalformedConfig extends ConfigError {
    /** Malformed config.
     * @param {string} message - JSON or AJV error message. */
    constructor(message: string);
}
