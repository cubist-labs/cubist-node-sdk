import { ConfigError } from './config/errors';
import { NetworkProfile, EndpointConfig } from './config/network';
import { find_file } from './utils';
import { PathBuf } from './config/pre_compile_manifest';
export * from './config/errors';
export * from './config/pre_compile_manifest';
export * from './config/network';
/** @internal Error raised when we can't find the config file */
export declare class FileNotFound extends ConfigError {
    /** Can't find the config file.
     * @param {PathBuf?} file - The file we couldn't find (or default config file).
     */
    constructor(file?: PathBuf);
}
/** @internal Error raised when contract files are not within root directory. */
export declare class InvalidContractFilePaths extends ConfigError {
    /** Invalid contract file paths.
     * @param {PathBuf[]} paths - Paths that are not within the root directory.
     */
    constructor(paths: PathBuf[]);
}
/** @internal Error raised when a target has no matching files. */
export declare class NoFilesForTarget extends ConfigError {
    /** No files for target.
      * @param {Target} target - The target that has no files missing.
      */
    constructor(target: Target);
}
/** @internal Error raised when `network_profile` is specified but
 * no such network profile is defined under `network_profiles`. */
export declare class MissingNetworkProfile extends ConfigError {
    /** Missing network profile.
     * @param {NetworkProfileName} profile - The profile that is missing.
     */
    constructor(profile: NetworkProfileName);
}
/**
 * Type alias for "network profile name" to be used in hash maps.
 *
 * @group Internal
 * */
export type NetworkProfileName = string;
/** Project type.
 *
 * @group Internal
 * */
export declare enum ProjType {
    /**  JavaScript */
    JavaScript = "JavaScript",
    /**  TypeScript */
    TypeScript = "TypeScript",
    /**  Rust */
    Rust = "Rust"
}
/**
 * The compiler used for compiling contract code. For now only `solc`.
 *
 * @group Internal
 * */
export declare enum Compiler {
    /**  Compile with the solc compiler. */
    Solc = "solc",
    /**  Compile with the solang compiler.
    * @ignore
    * TODO: remove
    * */
    Solang = "solang"
}
/** Target chains (e.g., Avalanche, Polygon, Ethereum) for which we can deploy
 * contracts.
 *
 * @group Core
 * */
export declare enum Target {
    /**  The avalanche chain */
    Avalanche = "avalanche",
    /**  The polygon chain */
    Polygon = "polygon",
    /**  The ethereum chain */
    Ethereum = "ethereum",
    /** The avalanche subnet chain */
    AvaSubnet = "ava_subnet"
}
/** Target configuration.
 *
 * @group Internal
 * */
export interface TargetConfig {
    /**  List of source files (after we resolve globs). */
    files: PathBuf[];
    /**  Compiler to compile the contract with. */
    compiler: Compiler;
}
/**
 * Contract configuration.
 *
 * @group Internal
 * */
export declare class ContractsConfig {
    /**  Root directory for contracts. */
    root_dir: PathBuf;
    /**  Target chain. */
    targets: Map<Target, TargetConfig>;
    /** Paths to search for imports. */
    import_dirs: PathBuf[];
    /** Paths relative to the root directory.
     * @param {PathBuf} p path to resolve relative to the root.
     * @return {PathBuf} resolved path.
     * @throws {InvalidContractFilePaths} if the path is not within the root directory.
     */
    relative_to_root(p: PathBuf): PathBuf;
}
/** @internal Top-level cubist application configuration. */
export interface IConfig {
    /**  Project type */
    type: ProjType;
    /**  Path to the build directory. */
    build_dir: PathBuf;
    /**  Path to the deploy directory. */
    deploy_dir: PathBuf;
    /**  Contract configurations. */
    contracts: ContractsConfig;
    /** A map of named network profiles for use in development, testing, etc. */
    network_profiles: {
        [profile: NetworkProfileName]: NetworkProfile;
    };
    /**  Selected network profile.  If omitted, defaults to "default". A network
    * profile with the same name must be defined in `network_profiles`. */
    current_network_profile: NetworkProfileName;
    /** Allows or disables imports from external sources (GitHub and npm/Yarn). */
    allow_import_from_external: boolean;
}
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
export declare class Config {
    private json;
    static readonly DEFAULT_FILENAME = "cubist-config.json";
    /** Absolute path to the file corresponding to this configuration.
    * @ignore */
    readonly config_path: string;
    /**  Project type */
    get type(): ProjType;
    private _type;
    /** Selected network profile.  If omitted, defaults to "default". A network
    * profile with the same name must be defined in `network_profiles`. */
    get current_network_profile(): NetworkProfileName;
    private _current_network_profile;
    /** Allows or disables imports from external sources (GitHub and npm/Yarn). */
    get allow_import_from_external(): boolean;
    private _allow_import_from_external;
    /** @ignore Empty constructor */
    private constructor();
    /** Create configuration from config file in the current directory or some
     * parent directory.
     * @return {Config} the configuration.
     */
    static nearest(): Config;
    /** Create configuration from directory (using default filename).
     * @param {PathBuf} dir the directory.
     * @return {Config} the configuration.
     */
    static from_dir(dir: PathBuf): Config;
    /**
     * Create configuration from JSON file.
     * @param {PathBuf} config_path Path to the configuration file.
     * @return {Config} the configuration.
     */
    static from_file(config_path: PathBuf): Config;
    /** Get the absolute project directory.
     * @return {PathBuf} the absolute project directory.
     */
    project_dir(): PathBuf;
    /** Get the absolute deploy directory.
     * @return {PathBuf} the absolute deploy directory.
     */
    deploy_dir(): PathBuf;
    /** Set the build directory. This function is for internal-use only. We use
     * it in the TestDK when we create a Cubist project with a temporary build
     * directory.
     * @internal
     * @arg {PathBuf} dir - the deploy directory.
     */
    __set_build_dir(dir: PathBuf): void;
    /** Set the deploy directory. This function is for internal-use only. We use
     * it in the TestDK when we create a Cubist project with a temporary deploy
     * directory.
     * @internal
     * @arg {PathBuf} dir - the deploy directory.
     */
    __set_deploy_dir(dir: PathBuf): void;
    /** Get the absolute build directory.
     * @return {PathBuf} the absolute build directory.
     */
    build_dir(): PathBuf;
    /** Return path relative to the project root (if not absolute)
     * @param {PathBuf} file the path to make relative to the project directory.
     * @return {PathBuf} the absolute path.
     */
    private relative_to_project;
    /** Get contracts config with paths "canonicalized" (cleaned up and absolute).
     * @return {ContractsConfig} the contracts config.
     */
    contracts(): ContractsConfig;
    /**
    * Return all targets.
    * @return {Target[]} the targets.
    * */
    targets(): Target[];
    /** Return configured network (if any) for a given target.
      * @param {Target} target the target name.
      * @return {EndpointConfig|undefined} the network config if it exists.
      */
    network_for_target(target: Target): EndpointConfig | undefined;
    /** Return configured network (if any) for a given target in a given profile.
     * @param {Target} target the target name.
     * @param {NetworkProfileName} profile_name the network profile name.
     * @return {EndpointConfig|undefined} the network config if it exists.
     */
    private network_for_target_in_profile;
    /** Return the currently selected network profile.
    * @return {NetworkProfile} the current network profile.
    **/
    network_profile(): NetworkProfile;
    /** Return the network profile by name.
     * @param {string} name profile name
     * @return {NetworkProfile} corresponding to a given name.
     **/
    network_profile_by_name(name: NetworkProfileName): NetworkProfile;
    /**
     * Generate TypeScript types for the configuration.
     */
    generate_types(): Promise<void>;
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
    static _from_json(json: IConfig, config_path: PathBuf): Config;
    /** Type the underlying json contracts config and make sure that paths are
     * "canonicalized" (cleaned up and absolute). When we read the JSON config,
     * we don't automatically parse the contracts into a typed ContractsConfig;
     * this functions does this and canonicalizes the paths. This function should
     * be called in the constructor, once. */
    private typeContractsConfig;
    /** Same as typeContractsConfig, but for networks. */
    private typeNetworks;
    /** Node's resolver as of v17 prefers ipv6; for localhost, our cubist cli
     * binds to ipv4. Set the resolver to prefer ipv4 if any of the URLs are
    * localhost. */
    private setDNSPriorityToIPv4ifLocalhost;
    /** Check that the config is valid. */
    private validate;
    /** Check if the contracts config is valid. */
    private validate_contract_paths;
    /** Check if targets point to valid (defined) networks. */
    private validate_network_profiles;
}
/**
 * Exports for tests
 * @ignore
 */
export declare const _testExports: {
    find_file: typeof find_file;
    network_for_target_in_profile: any;
};
