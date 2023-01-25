/**
 * Paths are just strings in node.
 *
 * @group Internal
 * */
export type PathBuf = string;
/**
* Contract names (strings).
*
* @group Core
* */
export type ContractName = string;
/** @internal Manifest generated by cubist pre-compile. */
export interface IPreCompileManifest {
    /** Produced files. */
    files: IFileArtifact[];
}
/** @internal contract dependencies interface */
export interface IContractDependencies {
    /** A contract name mapped to its dependencies */
    [name: string]: string[];
}
/** @internal Interface for a file produced during the 'pre-compile' step. */
export interface IFileArtifact {
    /** Whether this is an auto-generated shim contract or not */
    is_shim: boolean;
    /** Path relative to the directory of the manifest file */
    rel_path: PathBuf;
    /** Names of contracts defined in this file, each mapped to other contracts
     * (not necessarily in the same file) that it may call. */
    contract_dependencies: IContractDependencies;
}
/** @internal A file produced during the 'pre-compile' step. */
export declare class FileArtifact {
    /** Whether this is an auto-generated shim contract or not */
    is_shim: boolean;
    /** Path relative to the directory of the manifest file */
    rel_path: PathBuf;
    /** Names of contracts defined in this file, each mapped to other contracts
     * (not necessarily in the same file) that it may call. */
    contract_dependencies: {
        [name: string]: string[];
    };
}
/** @internal Manifest generated by `cubist pre-compile`. This class is a
 * subset of our Rust SDK `PreCompileManifest` struct, intended to be used for
 * reading pre-compile manifest files (but not writing them).
 *
 * Manifests contains info about the original as well as generated
 * (shim/interface) contracts. These files are, by default, stored within the
 * contracts directory of each target build (see Path below).
 *
 * Path: `{build_dir}/{target}/contracts/cubist-manifest.json`
 *
 * Example JSON file produced by `cubist pre-compile`:
 * ```json
 * {
 *    "files": [
 *        {
 *            "is_shim": false,
 *            "rel_path": "poly.sol",
 *            "contract_dependencies": {
 *               "PolyCounter": [ "EthCounter" ]
 *            }
 *        },
 *        {
 *           "is_shim": true,
 *           "rel_path": "EthCounter.sol",
 *           "contract_dependencies": {
 *              "EthCounter": []
 *           }
 *        }
 *    ]
 * }
 * ```
 *
 * This manifest tells other `cubist` commands where to find contract files
 * (`poly.sol`) for the target chain and which source files have generated shim
 * contracts (`EthCounter.sol`). It's also used by this SDK e.g., to implement
 * {@link ContractFactory.deploy}.
 *
 * **NOTE**: Most users don't need to use this class; manifests are internal to
 * Cubist. */
export declare class PreCompileManifest {
    /** Produced files. */
    get files(): FileArtifact[];
    private _files;
    /** @ignore Empty constructor */
    private constructor();
    /**
     * Create manifest from JSON file.
     * @param {PathBuf} file Path to the manifest file.
     * @return {PreCompileManifest} the manifest.
     */
    static from_file(file: PathBuf): PreCompileManifest;
    /**
     * Create manifest from JSON object.
     *
     * This is largely used for testing. This function is not exposed in the Rust
     * SDK; it might go away from the JS SDK as well.
     *
     * @param {IPreCompileManifest} json the manifest object.
     * @return {PreCompileManifest} the manifest.
     * @internal
     */
    static _from_json(json: IPreCompileManifest): PreCompileManifest;
}