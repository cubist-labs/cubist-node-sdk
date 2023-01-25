"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MalformedConfig = exports.ConfigError = void 0;
/**
* Errors raised by this package when loading configurations.
* @internal
**/
class ConfigError extends Error {
    /** Configuration error.
      * @param {string} message - Error message. */
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
/**
* Error raised when deserialization fails.
* @internal
**/
class MalformedConfig extends ConfigError {
    /** Malformed config.
     * @param {string} message - JSON or AJV error message. */
    constructor(message) {
        super(`Malformed config: ${message}`);
        this.name = 'MalformedConfig';
    }
}
exports.MalformedConfig = MalformedConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7OztHQUdHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsS0FBSztJQUNwQzttREFDK0M7SUFDL0MsWUFBWSxPQUFlO1FBQ3pCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQVBELGtDQU9DO0FBRUQ7OztHQUdHO0FBQ0gsTUFBYSxlQUFnQixTQUFRLFdBQVc7SUFDOUM7OERBQzBEO0lBQzFELFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMscUJBQXFCLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFQRCwwQ0FPQyJ9