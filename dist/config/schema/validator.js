"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePreCompileManifest = exports.validateConfig = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const errors_1 = require("../errors");
const config_schema_json_1 = __importDefault(require("./config.schema.json"));
const pre_compile_manifest_schema_json_1 = __importDefault(require("./pre_compile_manifest.schema.json"));
// Extend the validator with custom formats we need
/** Validate uint16.
  * @param {number} n - the number to validate.
  * @return {boolean} true if valid. */
function validateUint16(n) {
    return Number.isSafeInteger(n) && n >= 0 && n < 2 ** 16;
}
/** Validate uint32.
  * @param {number} n - the number to validate.
  * @return {boolean} true if valid. */
function validateUint32(n) {
    return Number.isSafeInteger(n) && n >= 0 && n < 2 ** 32;
}
// Create schema validator that also set default values from schema.
const ajv = new ajv_1.default({
    useDefaults: true,
    // ajv's support for defaults within more complex schema is not great, so we
    // can't use strict mode for now.
    strict: false,
});
(0, ajv_formats_1.default)(ajv);
ajv.addFormat('uint16', {
    type: 'number',
    validate: validateUint16,
});
ajv.addFormat('uint32', {
    type: 'number',
    validate: validateUint32,
});
const validate_config = ajv.compile(config_schema_json_1.default);
const validate_pre_compile_manifest = ajv.compile(pre_compile_manifest_schema_json_1.default);
/** Validate a config object.
 * @param {any} config - the config object to validate.
 * @throws {MalformedConfig} if the config is invalid. */
function validateConfig(config) {
    if (!validate_config(config)) {
        throw new errors_1.MalformedConfig(ajv.errorsText(validate_config.errors));
    }
}
exports.validateConfig = validateConfig;
/** Validate a pre-compile manifest object.
 * @param {any} manifest - the manifest object to validate.
 * @throws {MalformedConfig} if the manifest is invalid. */
function validatePreCompileManifest(manifest) {
    if (!validate_pre_compile_manifest(manifest)) {
        throw new errors_1.MalformedConfig(ajv.errorsText(validate_pre_compile_manifest.errors));
    }
}
exports.validatePreCompileManifest = validatePreCompileManifest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmZpZy9zY2hlbWEvdmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhDQUFzQjtBQUN0Qiw4REFBcUM7QUFFckMsc0NBQTZDO0FBRTdDLDhFQUFnRDtBQUNoRCwwR0FBMEU7QUFFMUUsbURBQW1EO0FBRW5EOzt1Q0FFdUM7QUFDdkMsU0FBUyxjQUFjLENBQUMsQ0FBUztJQUMvQixPQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMxRCxDQUFDO0FBRUQ7O3VDQUV1QztBQUN2QyxTQUFTLGNBQWMsQ0FBQyxDQUFTO0lBQy9CLE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFELENBQUM7QUFFRCxvRUFBb0U7QUFDcEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFHLENBQUM7SUFDbEIsV0FBVyxFQUFFLElBQUk7SUFDakIsNEVBQTRFO0lBQzVFLGlDQUFpQztJQUNqQyxNQUFNLEVBQUUsS0FBSztDQUNkLENBQUMsQ0FBQztBQUNILElBQUEscUJBQVUsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUN0QixJQUFJLEVBQUUsUUFBUTtJQUNkLFFBQVEsRUFBRSxjQUFjO0NBQ3pCLENBQUMsQ0FBQztBQUNILEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO0lBQ3RCLElBQUksRUFBRSxRQUFRO0lBQ2QsUUFBUSxFQUFFLGNBQWM7Q0FDekIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyw0QkFBWSxDQUFDLENBQUM7QUFDbEQsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLDBDQUF3QixDQUFDLENBQUM7QUFFNUU7O3lEQUV5RDtBQUN6RCxTQUFnQixjQUFjLENBQUMsTUFBTTtJQUNuQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzVCLE1BQU0sSUFBSSx3QkFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDbkU7QUFDSCxDQUFDO0FBSkQsd0NBSUM7QUFFRDs7MkRBRTJEO0FBQzNELFNBQWdCLDBCQUEwQixDQUFDLFFBQVE7SUFDakQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVDLE1BQU0sSUFBSSx3QkFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUNqRjtBQUNILENBQUM7QUFKRCxnRUFJQyJ9