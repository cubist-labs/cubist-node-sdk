"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._testExports = exports.Config = exports.ContractsConfig = exports.Target = exports.Compiler = exports.ProjType = exports.MissingNetworkProfile = exports.NoFilesForTarget = exports.InvalidContractFilePaths = exports.FileNotFound = void 0;
/**
 * This module exposes the {@link Config} class that exposes an interface for
 * accessing project configurations.
 *
 * @module
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fast_glob_1 = require("fast-glob");
const url_1 = require("url");
const process_1 = require("process");
const errors_1 = require("./config/errors");
const validator_1 = require("./config/schema/validator");
const utils_1 = require("./utils");
const typechain = __importStar(require("typechain"));
const dns_1 = require("dns");
__exportStar(require("./config/errors"), exports);
__exportStar(require("./config/pre_compile_manifest"), exports);
__exportStar(require("./config/network"), exports);
/** @internal Error raised when we can't find the config file */
class FileNotFound extends errors_1.ConfigError {
    /** Can't find the config file.
     * @param {PathBuf?} file - The file we couldn't find (or default config file).
     */
    constructor(file) {
        super(`Could not find config file ${file || Config.DEFAULT_FILENAME}`);
        this.name = 'FileNotFound';
    }
}
exports.FileNotFound = FileNotFound;
/** @internal Error raised when contract files are not within root directory. */
class InvalidContractFilePaths extends errors_1.ConfigError {
    /** Invalid contract file paths.
     * @param {PathBuf[]} paths - Paths that are not within the root directory.
     */
    constructor(paths) {
        super(`Contract source files outside root directory: ${paths}`);
        this.name = 'InvalidContractFilePaths';
    }
}
exports.InvalidContractFilePaths = InvalidContractFilePaths;
/** @internal Error raised when a target has no matching files. */
class NoFilesForTarget extends errors_1.ConfigError {
    /** No files for target.
      * @param {Target} target - The target that has no files missing.
      */
    constructor(target) {
        super(`No files for target ${target}`);
        this.name = 'NoFilesForTarget';
    }
}
exports.NoFilesForTarget = NoFilesForTarget;
/** @internal Error raised when `network_profile` is specified but
 * no such network profile is defined under `network_profiles`. */
class MissingNetworkProfile extends errors_1.ConfigError {
    /** Missing network profile.
     * @param {NetworkProfileName} profile - The profile that is missing.
     */
    constructor(profile) {
        super(`Specified network profile ('${profile}') not found`);
        this.name = 'MissingNetworkProfile';
    }
}
exports.MissingNetworkProfile = MissingNetworkProfile;
/** Project type.
 *
 * @group Internal
 * */
var ProjType;
(function (ProjType) {
    /**  JavaScript */
    ProjType["JavaScript"] = "JavaScript";
    /**  TypeScript */
    ProjType["TypeScript"] = "TypeScript";
    /**  Rust */
    ProjType["Rust"] = "Rust";
})(ProjType = exports.ProjType || (exports.ProjType = {}));
/**
 * The compiler used for compiling contract code. For now only `solc`.
 *
 * @group Internal
 * */
var Compiler;
(function (Compiler) {
    /**  Compile with the solc compiler. */
    Compiler["Solc"] = "solc";
    /**  Compile with the solang compiler.
    * @ignore
    * TODO: remove
    * */
    Compiler["Solang"] = "solang";
})(Compiler = exports.Compiler || (exports.Compiler = {}));
/** Target chains (e.g., Avalanche, Polygon, Ethereum) for which we can deploy
 * contracts.
 *
 * @group Core
 * */
var Target;
(function (Target) {
    /**  The avalanche chain */
    Target["Avalanche"] = "avalanche";
    /**  The polygon chain */
    Target["Polygon"] = "polygon";
    /**  The ethereum chain */
    Target["Ethereum"] = "ethereum";
    /** The avalanche subnet chain */
    Target["AvaSubnet"] = "ava_subnet";
})(Target = exports.Target || (exports.Target = {}));
/**
 * Contract configuration.
 *
 * @group Internal
 * */
class ContractsConfig {
    /** Paths relative to the root directory.
     * @param {PathBuf} p path to resolve relative to the root.
     * @return {PathBuf} resolved path.
     * @throws {InvalidContractFilePaths} if the path is not within the root directory.
     */
    relative_to_root(p) {
        // / If p is under root_dir, returns its relative path (strip prefix).
        if (p.startsWith(this.root_dir)) {
            return path.relative(this.root_dir, p);
        }
        throw new InvalidContractFilePaths([p]);
    }
}
exports.ContractsConfig = ContractsConfig;
/**
 * Class that exposes Cubist project configurations (and resolves and validates
 * path names, network configurations, etc.).
 *
 * All cubist applications have a JSON config file ({@link DEFAULT_FILENAME}),
 * which specifies the kind of project ({@link ProjType}]) the application code
 * is written in, where build output should be written to, and where deployment
 * scripts and information should be generated.
 *
 * Example configuration file:
 * ``` json
 * {
 *   "type": "TypeScript",
 *   "build_dir": "build",
 *   "deploy_dir": "deploy",
 *   "contracts": {
 *     "root_dir": "contracts",
 *     "targets": {
 *       "ethereum" : {
 *         "files": ["./contracts/StorageReceiver.sol"]
 *       },
 *       "polygon": {
 *         "files": ["./contracts/StorageSender.sol"]
 *       }
 *     },
 *     "import_dirs": [
 *       "node_modules"
 *     ]
 *   },
 *   "allow_import_from_external": true,
 *   "network_profiles": {
 *       "default": {
 *           "ethereum": { "url": "http://127.0.0.1:8545/" },
 *           "polygon":  { "url": "http://127.0.0.1:9545" }
 *       }
 *   }
 * }
 * ```
 *
 * You can load config files with {@link nearest}, which finds the JSON file in
 * the current directory or any parent directory:
 *
 * ```
 * const cfg = Config.nearest();
 * ```
 * Alternatively, you can load the default config in the directory with
 * {@link from_dir}:
 * ```
 * const cfg = Config.from_dir("/path/to/my-app");
 * ```
 *
 * Alternatively, you can just use {@link from_file} if you have the filename
 * of the config file:
 *
 * ```
 * const cfg = Config.from_file("/path/to/cubist-config.json");
 * ```
 *
 * This class exposes a subset of the functionality available in our Rust SDK.
 * In particular, this class is only intended to be used to read configurations
 * from the file system. This means that every Config object should be treated as
 * effectively read-only.
 *
 * :::note
 * Most users don't need to use this class; the class you likely want to use is
 * {@link cubist.Cubist}, which transparently loads configurations.
 * :::
 *
 * @group Internal
 * */
class Config {
    /**  Project type */
    get type() {
        return this._type;
    }
    /** Selected network profile.  If omitted, defaults to "default". A network
    * profile with the same name must be defined in `network_profiles`. */
    get current_network_profile() {
        return this._current_network_profile;
    }
    /** Allows or disables imports from external sources (GitHub and npm/Yarn). */
    get allow_import_from_external() {
        return this._allow_import_from_external;
    }
    /** @ignore Empty constructor */
    constructor() {
        // @eslint-disable-line @typescript-eslint/no-empty-function
    }
    /** Create configuration from config file in the current directory or some
     * parent directory.
     * @return {Config} the configuration.
     */
    static nearest() {
        return Config.from_dir((0, process_1.cwd)());
    }
    /** Create configuration from directory (using default filename).
     * @param {PathBuf} dir the directory.
     * @return {Config} the configuration.
     */
    static from_dir(dir) {
        return Config.from_file(path.join(dir, Config.DEFAULT_FILENAME));
    }
    /**
     * Create configuration from JSON file.
     * @param {PathBuf} config_path Path to the configuration file.
     * @return {Config} the configuration.
     */
    static from_file(config_path) {
        // Read the config file
        const json = JSON.parse(fs.readFileSync(config_path, 'utf8'));
        return Config._from_json(json, path.resolve(config_path));
    }
    /** Get the absolute project directory.
     * @return {PathBuf} the absolute project directory.
     */
    project_dir() {
        return path.dirname(this.config_path);
    }
    /** Get the absolute deploy directory.
     * @return {PathBuf} the absolute deploy directory.
     */
    deploy_dir() {
        return this.relative_to_project(this.json.deploy_dir);
    }
    /** Set the build directory. This function is for internal-use only. We use
     * it in the TestDK when we create a Cubist project with a temporary build
     * directory.
     * @internal
     * @arg {PathBuf} dir - the deploy directory.
     */
    __set_build_dir(dir) {
        this.json.build_dir = dir;
    }
    /** Set the deploy directory. This function is for internal-use only. We use
     * it in the TestDK when we create a Cubist project with a temporary deploy
     * directory.
     * @internal
     * @arg {PathBuf} dir - the deploy directory.
     */
    __set_deploy_dir(dir) {
        this.json.deploy_dir = dir;
    }
    /** Get the absolute build directory.
     * @return {PathBuf} the absolute build directory.
     */
    build_dir() {
        return this.relative_to_project(this.json.build_dir);
    }
    /** Return path relative to the project root (if not absolute)
     * @param {PathBuf} file the path to make relative to the project directory.
     * @return {PathBuf} the absolute path.
     */
    relative_to_project(file) {
        const p = path.isAbsolute(file) ? file : path.join(this.project_dir(), file);
        return path.normalize(p);
    }
    /** Get contracts config with paths "canonicalized" (cleaned up and absolute).
     * @return {ContractsConfig} the contracts config.
     */
    contracts() {
        return this.json.contracts;
    }
    /**
    * Return all targets.
    * @return {Target[]} the targets.
    * */
    targets() {
        return Array.from(this.json.contracts.targets.keys());
    }
    /** Return configured network (if any) for a given target.
      * @param {Target} target the target name.
      * @return {EndpointConfig|undefined} the network config if it exists.
      */
    network_for_target(target) {
        return this.network_for_target_in_profile(target, this.current_network_profile);
    }
    /** Return configured network (if any) for a given target in a given profile.
     * @param {Target} target the target name.
     * @param {NetworkProfileName} profile_name the network profile name.
     * @return {EndpointConfig|undefined} the network config if it exists.
     */
    network_for_target_in_profile(target, profile_name) {
        const profile = this.json.network_profiles[profile_name];
        return profile ? profile[target] : undefined;
    }
    /** Return the currently selected network profile.
    * @return {NetworkProfile} the current network profile.
    **/
    network_profile() {
        return this.json.network_profiles[this.current_network_profile];
    }
    /** Return the network profile by name.
     * @param {string} name profile name
     * @return {NetworkProfile} corresponding to a given name.
     **/
    network_profile_by_name(name) {
        return this.json.network_profiles[name];
    }
    /**
     * Generate TypeScript types for the configuration.
     */
    async generate_types() {
        for (const target of this.targets()) {
            const build_dir = path.join(this.build_dir(), target);
            const outDir = path.join(build_dir, 'types');
            const allFiles = (0, fast_glob_1.sync)('artifacts/*.sol/*.json', { cwd: build_dir, }).
                map((f) => path.join(build_dir, f));
            await typechain.runTypeChain({
                cwd: build_dir,
                filesToProcess: allFiles,
                allFiles,
                outDir,
                target: 'ethers-v5',
            });
        }
    }
    /** **********************************************************************
     * Internals                                                             *
     *************************************************************************/
    /**
     * Create configuration from JSON object.
     *
     * This is used for internally and testing. This function is not exposed in
     * the Rust SDK; it might go away from the JS SDK as well.
     *
     * @param {IConfig} json the configuration object.
     * @param {PathBuf} config_path the path to the config file (potentially nonexistant yet).
     * @return {Config} the configuration.
     * @internal
     */
    static _from_json(json, config_path) {
        const self = new Config();
        // Set the underlying JSON
        self.json = json;
        // Validate the json against the schema
        (0, validator_1.validateConfig)(self.json);
        // Set stuff from self.json
        self._type = self.json.type;
        self._current_network_profile = self.json.current_network_profile;
        self._allow_import_from_external = self.json.allow_import_from_external;
        // Set the config path to the real path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        self /* to bypass read-only */.config_path = config_path;
        // Update the underlying JSON with typed values
        // 1. typed contracts config and resolve globs
        self.typeContractsConfig();
        // 2. typed networks
        self.typeNetworks();
        // Validate config
        self.validate();
        // Set resolver prerference to ipv4
        self.setDNSPriorityToIPv4ifLocalhost();
        return self;
    }
    /** Type the underlying json contracts config and make sure that paths are
     * "canonicalized" (cleaned up and absolute). When we read the JSON config,
     * we don't automatically parse the contracts into a typed ContractsConfig;
     * this functions does this and canonicalizes the paths. This function should
     * be called in the constructor, once. */
    typeContractsConfig() {
        const contracts = new ContractsConfig();
        contracts.root_dir = this.relative_to_project(this.json.contracts.root_dir);
        contracts.import_dirs = this.json.contracts.import_dirs.map((d) => this.relative_to_project(d));
        contracts.targets = new Map();
        // Normalize each contract directory
        for (const [target, target_config] of Object.entries(this.json.contracts.targets)) {
            const files = [];
            // resolve globs
            target_config.files.forEach((glob) => {
                (0, fast_glob_1.sync)(glob, { cwd: this.project_dir(), }).forEach((file) => {
                    files.push(this.relative_to_project(file));
                });
            });
            contracts.targets.set(target, {
                files,
                compiler: target_config.compiler || Compiler.Solc,
            });
        }
        this.json.contracts = contracts;
    }
    /** Same as typeContractsConfig, but for networks. */
    typeNetworks() {
        // Update the url (NetworkProfile is an interface not class) to be a URL
        for (const network_profile of Object.values(this.json.network_profiles)) {
            for (const endpoint_config of Object.values(network_profile)) {
                endpoint_config.url = new url_1.URL(endpoint_config.url);
            }
        }
    }
    /** Node's resolver as of v17 prefers ipv6; for localhost, our cubist cli
     * binds to ipv4. Set the resolver to prefer ipv4 if any of the URLs are
    * localhost. */
    setDNSPriorityToIPv4ifLocalhost() {
        for (const network_profile of Object.values(this.json.network_profiles)) {
            for (const endpoint_config of Object.values(network_profile)) {
                if (endpoint_config.url.hostname === 'localhost') {
                    (0, dns_1.setDefaultResultOrder)('ipv4first');
                    return;
                }
            }
        }
    }
    /** Check that the config is valid. */
    validate() {
        // Validate paths
        this.validate_contract_paths();
        // Validate network profiles
        this.validate_network_profiles();
    }
    /** Check if the contracts config is valid. */
    validate_contract_paths() {
        // make sure every target_config file is in root_dir
        const contracts = this.contracts();
        const root_dir = contracts.root_dir;
        const bad_paths = [];
        for (const [target, target_config] of contracts.targets) {
            if (target_config.files.length === 0) {
                throw new NoFilesForTarget(target);
            }
            for (const file of target_config.files) {
                if (!file.startsWith(root_dir)) {
                    bad_paths.push(file);
                }
            }
        }
        if (bad_paths.length > 0) {
            throw new InvalidContractFilePaths(bad_paths);
        }
    }
    /** Check if targets point to valid (defined) networks. */
    validate_network_profiles() {
        // network profile is valid
        if (this.current_network_profile !== 'default' &&
            !(this.current_network_profile in this.json.network_profiles)) {
            throw new MissingNetworkProfile(this.current_network_profile);
        }
    }
}
exports.Config = Config;
// Default cubist config filename
Config.DEFAULT_FILENAME = 'cubist-config.json';
/**
 * Exports for tests
 * @ignore
 */
exports._testExports = {
    find_file: utils_1.find_file,
    network_for_target_in_profile: Config.prototype. // eslint-disable-line @typescript-eslint/no-explicit-any
        network_for_target_in_profile,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3Qix5Q0FBOEM7QUFDOUMsNkJBQTJCO0FBQzNCLHFDQUErQjtBQUMvQiw0Q0FBK0M7QUFFL0MseURBQTREO0FBQzVELG1DQUFxQztBQUNyQyxxREFBdUM7QUFDdkMsNkJBQTZDO0FBRzdDLGtEQUFnQztBQUNoQyxnRUFBOEM7QUFDOUMsbURBQWlDO0FBRWpDLGdFQUFnRTtBQUNoRSxNQUFhLFlBQWEsU0FBUSxvQkFBVztJQUMzQzs7T0FFRztJQUNILFlBQVksSUFBYztRQUN4QixLQUFLLENBQUMsOEJBQThCLElBQUksSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDO0lBQzdCLENBQUM7Q0FDRjtBQVJELG9DQVFDO0FBRUQsZ0ZBQWdGO0FBQ2hGLE1BQWEsd0JBQXlCLFNBQVEsb0JBQVc7SUFDdkQ7O09BRUc7SUFDSCxZQUFZLEtBQWdCO1FBQzFCLEtBQUssQ0FBQyxpREFBaUQsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSSxHQUFHLDBCQUEwQixDQUFDO0lBQ3pDLENBQUM7Q0FDRjtBQVJELDREQVFDO0FBRUQsa0VBQWtFO0FBQ2xFLE1BQWEsZ0JBQWlCLFNBQVEsb0JBQVc7SUFDL0M7O1FBRUk7SUFDSixZQUFZLE1BQWM7UUFDeEIsS0FBSyxDQUFDLHVCQUF1QixNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztDQUNGO0FBUkQsNENBUUM7QUFFRDtrRUFDa0U7QUFDbEUsTUFBYSxxQkFBc0IsU0FBUSxvQkFB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