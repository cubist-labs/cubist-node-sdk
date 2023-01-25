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
exports.Contract = exports.ContractFactory = exports.Cubist = exports.find_file = exports.solidity = exports.BigNumber = exports.internal = void 0;
/**
 * This module exports a simple interface for working with Cubist projects and
 * their smart contracts:
 *
 *   - {@link Cubist} abstracts over cubist projects and is _the_ way to access
 *   {@link Contract | contracts} and {@link ContractFactory | contract
 *   factories}.
 *   - {@link ContractFactory} is for deploying contracts and contract shims.
 *   - {@link Contract} is for interacting with deployed contracts.
 *
 * It also re-exports several references and type definitions (e.g., {@link
 * BigNumber}).
 *
 * All these definitions are exposed at the top-level, so you can simply import
 * them as:
 *
 * ```typescript
 * import { Cubist, } from '@cubist-labs/cubist'
 *
 * // ...
 * async function main() {
 *   const cubist = new Cubist(); // create new project
 *   await cubist.getContractFactory('MyContract').deploy()
 *   // ...
 * }
 * ```
 *
 * :::note
 * We classify exports into two categories: core and internal. As a user, you
 * should not really need to use or think abot internals; we only include them
 * in the documentation because you might encounter them reading our code.
 * :::
 *
 *
 * @module
 */
const path = __importStar(require("path"));
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const config_1 = require("./config");
const internal_1 = require("./internal");
__exportStar(require("./config"), exports);
/** @group Internal */
exports.internal = __importStar(require("./internal"));
/** @group Core */
var internal_2 = require("./internal");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return internal_2.BigNumber; } });
/** @group Internal */
var internal_3 = require("./internal");
Object.defineProperty(exports, "solidity", { enumerable: true, get: function () { return internal_3.solidity; } });
/** @ignore */
var utils_1 = require("./utils");
Object.defineProperty(exports, "find_file", { enumerable: true, get: function () { return utils_1.find_file; } });
/** @internal Serializes given manifest to JSON and writes it to a file atomically
 * (which guarantees that the relayer reads it after it has been flushed).
 *
 * @param {DeploymentManifest} dm - the deployment manifest to save
 * @param {PathBuf} manifestPath - the location where to save it
 *  */
async function writeAtomic(dm, manifestPath) {
    await (0, promises_1.mkdir)(path.dirname(manifestPath), { recursive: true, });
    const tempPath = `${manifestPath}.tmp`;
    await (0, promises_1.writeFile)(tempPath, JSON.stringify(dm, null, 2));
    await (0, promises_1.rename)(tempPath, manifestPath);
}
/**
 * This class is _the_ way to work with interface with your cubist
 * projects. This class abstracts over all contracts and contract factories.
 *
 * @example Create a new project to access contracts and their factories:
 *
 * ```typescript
 * const cubist = new Cubist();
 * // get contract factory
 * const Receiver = cubist.getContractFactory('Receiver');
 * // deploy Receiver, ...
 *
 * // get already deployed Sender contract
 * const senderInstance = cubist.getContract('Sender');
 *
 * // wait for bridge to spin up
 * assert(await cubist.whenBridged());
 * ```
 *
 * Beyond exposing project {@link Contract | contracts} (via {@link
 * getContract}) and {@link ContractFactory | contract factories} (via {@link
 * getContractFactory}), projects can wait for bridges (between contracts and
 * cross-chain shims they call) to start up with {@link whenBridged}.
 *
 * At build time, `cubist build` generates a [CubistORM] class that extends
 * {@link Cubist} with the project-specific factories (see
 * [Overview](/jsdoc/)). This means, in practice, you don't even need to use
 * {@link getContract} and {@link getContractFactory}.
 *
 * @example Create a new project to access contracts and their factories with [CubistORM]:
 *
 * ```typescript
 * import { CubistORM, } from '../build/orm/index.js';
 *
 * const cubist = new CubistORM();
 * // get contract factory
 * const Receiver = cubist.Receiver;
 * // deploy Receiver, ...
 *
 * // get already deployed Sender contract
 * const senderInstance = cubist.Sender.attach();
 *
 * // wait for bridge to spin up
 * assert(await cubist.whenBridged());
 * ```
 *
 * [CubistORM]: /jsdoc-md/cubist.CubistORM
 *
 * @group Core
 */
class Cubist {
    /** Create new project. The constructor looks for the nearest
     * `cubist-config.json`, i.e., it looks in the current directory and every
     * parent directory until it finds the config.
     *
     * If the code using this SDK is not in the same directory tree, though, you
     * can pass an explicit config:
     *
     * ```typescript
     * const config = new Config('/path/to/your/cubist-config.json');
     * const cubist = new Cubist (config);
     * ```
     *
     * In the future this argument might change, e.g., to a filename instead of
     * explicit {@link Config}.
     *
     * @param {Config?} config - Optional config (using near otherwise).
     * */
    constructor(config) {
        this.config = config ?? config_1.Config.nearest();
        this.targetMap = new Map();
        this.contractMap = new Map();
        this.shimMap = new Map();
        this.deps = new Map();
        this._initialized = false; // we lazily initialize the maps
    }
    /**
     * @internal Finish initializing the instance by loading the contract and
     * shim maps.
     */
    lazyInitialize() {
        if (this._initialized) {
            return;
        }
        // initialize the maps
        const build_dir = this.config.build_dir();
        for (const target of this.config.targets()) {
            this.targetMap.set(target, new internal_1.TargetProject(target, this.config));
            // Read all pre-compile manifest files for the target chain
            const manifest_file = path.join(build_dir, target, 'contracts', 'cubist-manifest.json');
            const manifest = config_1.PreCompileManifest.from_file(manifest_file);
            manifest.files.forEach((file) => {
                if (file.is_shim) {
                    // This is a generated file
                    for (const contractName of Object.keys(file.contract_dependencies)) {
                        if (this.shimMap.has(contractName)) {
                            this.shimMap.get(contractName).add(target);
                        }
                        else {
                            this.shimMap.set(contractName, new Set([target]));
                        }
                    }
                }
                else {
                    // This is a file with native contracts
                    //   -> add each contract to the contractMap
                    //   -> save its dependencies
                    for (const contractName of Object.keys(file.contract_dependencies)) {
                        const maybeTarget = this.contractMap.get(contractName);
                        if (maybeTarget && maybeTarget != target) {
                            throw new Error(`Unsupported: Contract ${contractName} defined across multiple targets.`);
                        }
                        this.contractMap.set(contractName, target);
                        this.deps.set(contractName, new Set(file.contract_dependencies[contractName]));
                    }
                }
            });
        }
        // done initializing!
        this._initialized = true;
    }
    /** Get contract factory given the contract name.
    * @param {ContractName} name - The contract name.
    * @return {ContractFactory} The contract factory.
    * */
    getContractFactory(name) {
        this.lazyInitialize();
        // Get the native contract factory
        const contractTarget = this.contractMap.get(name);
        if (!contractTarget) {
            throw new Error(`Contract factory ${name} not found`);
        }
        const contractProject = this.targetMap.get(contractTarget);
        const contractFactory = contractProject.getContractFactory(name);
        // Get shim contract factory (might be on zero or many chains)
        const shimFactoryMap = new Map();
        const shimTargets = this.shimMap.get(name);
        if (shimTargets) {
            for (const shimTarget of shimTargets) {
                const shimProject = this.targetMap.get(shimTarget);
                const shimFactory = shimProject.getContractFactory(name);
                shimFactoryMap.set(shimTarget, shimFactory);
            }
        }
        const shimDeps = this.deps.get(name);
        return new ContractFactory(name, this, contractProject, contractFactory, shimFactoryMap, shimDeps);
    }
    /** Get an existing deployed contract. This method looks up the contract's
     * deploy receipts in the `deploy` directory unless you explicitly tell it to
     * `ignoreReceipt`s (e.g., because you're trying to get a contract deployed
     * with another tool).
     *
     * :::note
     * For now we only support deploying a contract once so calling
     * `getContract` with the same name but different addresses is not yet
     * supported.
     * :::
     *
     * @param {ContractName} name - The contract name.
     * @param {ContractAddress?} addr - Optional contract address (if more than
     * one contract with same name).
     * @param {boolean} ignoreReceipt - Ignore receipt (e.g., if contract deployed
     * with another tool).
     * @return {Contract<T>} The contract.
     * @throws {Error} If the contract could not be found, if there are multiple
     * contracts and the address argument is omitted, or if the receipt is missing
     * (unless ignoreReceipt is set).
     * */
    getContract(name, addr, ignoreReceipt = false) {
        this.lazyInitialize();
        // Get the native contract
        const contractTarget = this.contractMap.get(name);
        if (!contractTarget) {
            throw new Error(`Could not find contract factory for ${name}`);
        }
        const contractProject = this.targetMap.get(contractTarget);
        const contract = contractProject.getNamedContract(name, addr, ignoreReceipt);
        // Get shim contract (might be on zero or many chains)
        const shimMap = new Map();
        const shimTargets = this.shimMap.get(name);
        if (shimTargets) {
            for (const shimTarget of shimTargets) {
                const shimProject = this.targetMap.get(shimTarget);
                // TODO(Issue #580): once we have proper support for multiple instances
                // of the same contract we need to get the address of the shim
                // corresponding to `contract`.
                const fqnShim = shimProject.getNamedContract(name, undefined, ignoreReceipt);
                shimMap.set(shimTarget, fqnShim.inner);
            }
        }
        return new Contract(contractProject, contract.fqn, contract.inner, shimMap);
    }
    /**
     * Returns a promise that completes once bridges have been established for
     * all contracts in this projects.
     *
     * @param {number} retries - how many times to check
     * @param {number} delayMs - delay in milliseconds between checks
     * @return {boolean} - true if all bridges have been established
     * @throws {Error} if any contract in this project has not been deployed
     */
    async whenBridged(retries = 100, delayMs = 100) {
        this.lazyInitialize();
        for (const contractName of this.contractMap.keys()) {
            const contract = this.getContract(contractName);
            const ok = await contract.whenBridged(retries, delayMs);
            if (!ok) {
                return false;
            }
        }
        return true;
    }
}
exports.Cubist = Cubist;
/**
 * Contract factories are used to create {@link Contract}s that span multiple
 * chains. Specifically, with a factory you can use:
 *
 * - {@link deploy} to deploy a {@link Contract} to its native target chain _and_
 *   automatically deploy its shims to the chains where this contract gets
 *   called.
 * - {@link deployShims} to deploy only the shims of the contract on all the
 *   chains the contract is called.
 * - {@link deployWithShims} to deploy the contract to its native target chain
 *   (given its already deployed shims). Together, {@link deployShims} and
 *   {@link deployWithShims}, make it possible to deploy shims before the
 *   native contract.
 * - {@link attach} to attach to an already deployed contract. This is the same
 *   as {@link Cubist.getContract}. We expose {@link attach} because the
 *   well-typed {@link Cubist} interface we generate at build time (with
 *   `cubist build`)---[CubistORM]---exports the project factories as
 *   properties on the object, eliding the need to use `getContractFactory` and
 *   `getContract`.
 *
 * @example
 * Get factory and deploy contract and its shims with {@link Cubist}.
 * ```typescript
 * const StorageReceiver = cubist.getContractFactory('StorageReceiver');
 * const receiver = await StorageReceiver.deploy(33);
 * ```

 * @example
 * Get factory and attach to existing deployed contract.
 * ```typescript
 * import { CubistORM, } from '../build/orm/index.js';
 * // ...
 * const StorageReceiver = cubist.StorageReceiver;
 * const receiver = StorageReceiver.attach();
 * ```
 *
 * [CubistORM]: /jsdoc-md/cubist.CubistORM
 *
 * @group Core
 * */
class ContractFactory {
    /** @internal Create new contract factory. The constructor is not intended to be called
     * directly. Use `getContractFactory` from the `Cubist` class instead.
     * @param {ContractName} name - The contract name.
     * @param {Cubist} cubist - The parent cubist project.
     * @param {TargetProject} project - The target chain project.
     * @param {internal.ContractFactory} internalFactory - The underlying contract factory.
     * @param {Map<Target, internal.ContractFactory>} shimFactoryMap - Map of shim contract factories.
     * @param {Set<ContractName>} shimDeps - Shims on this chain that this contract may call.
      */
    constructor(name, cubist, project, internalFactory, shimFactoryMap, shimDeps) {
        this.name = name;
        this.cubist = cubist;
        this.project = project;
        this.internalFactory = internalFactory;
        this.shimFactoryMap = shimFactoryMap;
        this.shimDeps = shimDeps;
    }
    /** Deploy contract and its shims.
     * This function deploys the contract to its target chain, and the shims to
     * their corresponding chains. We return a contract that encapsulates an
     * inner [ethers.js
     * Contract](https://docs.ethers.org/v5/api/contract/contract/) and exposes
     * some additional methods for interacting with the shims.
     *
     * :::note
     * For now, you can only deploy a single instance of a contract. The next
     * release of cubist will have support for multiple instances (Issue #580).
     * :::
     *
     * @param {any[]} args - Arguments to call contract constructor with.
     * @return {Promise<Contract>} The deployed contract.
     * */
    async deploy(...args) {
        if (this.project.isDeployed(this.name)) {
            throw new Error(`${this.name} was already deployed. Multiple deployments coming soon.`);
        }
        // deploy shims
        const shims = await this.deployShims();
        // deploy native contract
        return this.deployWithShims(shims, ...args);
    }
    /** Deploy contract given the already-deployed shims.
     * This function deploys the {@link Contract} to its native target chain.
     * The first argument is the return value from the {@link deployShims} function.
     * The rest of the arguments are the constructor arguments.
     *
     * This function is useful for deploying cross-chain contracts that mutually
     * depend on each other.
     *
     * @param {Map<Target, T>} shims - the previously deployed shims.
     * @param {any[]} args - Arguments to pass to call contract constructor with.
     * @return {Promise<Contract>} The deployed contract.
     * */
    async deployWithShims(shims, ...args) {
        if (this.project.isDeployed(this.name)) {
            throw new Error(`${this.name} was already deployed. Multiple deployments coming soon.`);
        }
        // deploy native contract
        const nativeContract = await this.internalFactory.deploy(...args);
        // for each dependency: make sure it's deployed (`getContract` throws
        // otherwise), and then call `approveCaller`
        for (const depName of this.shimDeps) {
            const depShim = this.project.getContract(depName);
            // TODO (Issue #513): Consider passing number of confirmations to `wait`
            // according to the target chain properties.
            await (await depShim.approveCaller(nativeContract.address)).wait();
        }
        const c = new Contract(this.project, this.internalFactory.fqn(), nativeContract, shims);
        await c.saveDeploymentManifest();
        return c;
    }
    /** Deploy shims for this contract. In some cases you need to deploy the
     * contract shims before the contract itself (see our [TokenBridge] for an
     * example). This method is used to do deploy the shims, which you can then
     * use when deploying the contract itself with {@link deployWithShims}.
     *
     * @example In our [TokenBridge] template (`cubist new --template
     * TokenBridge`) we set up a two way bridge across two chains and need to
     * deploy shims on one end to handle the circular dependency---the two
     * contracts mutually depend on each other.
     *
     * ```typescript
     * // deploy ERC20Bridged shims
     * const erc20bShims = await ERC20Bridged.deployShims();
     * // get the shim contract on the token sender chain
     * const erc20BridgedShim = erc20bShims.get(TokenSender.target());
     * // deploy the token sender contract and its shim
     * const tokenSender = await TokenSender.deploy(erc20BridgedShim.address);
     * // Deploy ERC20Bridged with the TokenSender address.
     * const erc20Bridged = await ERC20Bridged.deployWithShims(erc20bShims,
     * ```
     * @return {Promise<Map<Target, T>>} The deployed shims.
     *
     * [TokenBridge]: /guide/advanced-examples/Cross-chain-token-bridge
     */
    async deployShims() {
        const shims = new Map();
        // deploy shims
        for (const target of this.shimFactoryMap.keys()) {
            const shimContract = await this.deployShim(target);
            shims.set(target, shimContract);
        }
        return shims;
    }
    /** Get the already-deployed contract.
     * @return {Promise<Contract>} The deployed contract.
     */
    async deployed() {
        return this.cubist.getContract(this.name);
    }
    /** Get the already-deployed contract at particular address.
     * @param {ContractAddress} addr - Contract address.
     * @return {Promise<Contract>} The deployed contract.
     */
    async attach(addr) {
        return this.cubist.getContract(this.name, addr);
    }
    /** Deploy shim contract.
     * @param {Target} target - The target chain to deploy shim to.
     * @return {Promise<internal.Contract>} The deployed contract.
     * */
    async deployShim(target) {
        const shimFactory = this.shimFactoryMap.get(target);
        if (!shimFactory) {
            throw new Error(`Contract not compiled for ${target}`);
        }
        // For now shim constructors don't take any arguments. This might change in
        // the future. See issue #423.
        const contract = await shimFactory.deploy();
        return contract;
    }
    /** Get (native) target chain.
     * @return {Target} The target chain.
     * */
    target() {
        return this.project.target();
    }
}
exports.ContractFactory = ContractFactory;
/**
 * Multi-chain contract abstraction. Each Cubist contract encapsulates (for
 * now) an [ethers.js
 * Contract](https://docs.ethers.org/v5/api/contract/contract/)) that runs on a
 * _native target chain_ and zero or more _shim contracts_ running on other
 * chains.
 *
 * A contract deployed with {@link ContractFactory} is deployed to the chain
 * specified in the `cubist-config.json` configuration file; this is the native
 * target chain. If this contract is called on another chain, we also deploy
 * a _shim_ for this contract on that chain (either automatically when you use
 * {@link ContractFactory.deploy} or manually when you use
 * {@link ContractFactory.deployShims}).
 *
 * This class exposes the contract on the native target chains (via {@link
 * inner}), and several methods for getting the contract {@link target} chain,
 * its {@link address} on the native target chain, and its shims' {@link
 * addressOn | addresses on} other chains.
 *
 * @example ERC20 bridged from Avalanche to Polygon and Ethereum has a native
 * contract on Avalanche and corresponding shims on the other two chains.
 *
 * ```typescript
 * // ...
 * const cubist = new Cubist();
 * // get contract
 * const e20Bridged = cubist.getContract('ERC20Bridged');
 * // print its address on native chain
 * console.log(`address on ${e20Bridged.target()}: ${e20Bridged.address()}`);
 * // print its shims' addresses
 * console.log(`address on Polygon: ${e20Bridged.addressOn(Target.Polygon)}`);
 * console.log(`address on Ethereum: ${e20Bridged.addressOn(Target.Ethereum)}`);
 * ```
 *
 * @group Core
 * */
class Contract {
    /** @return {Target} - The target chain the contract was deployed to. */
    target() {
        return this.project.target();
    }
    /** @internal Create new contract. The constructor is not intended to be called
     * directly. Use {@link Cubist.getContract} instead (or get a
     * contract by {@link deploy}ing it via a factory).
     * @param {TargetProject} target - The target chain project.
     * @param {ContractFQN} fqn - The contract fully qualified name.
     * @param {T} inner - The underlying contract.
     * @param {Map<Target, internal.Contract>} shims - Map of shim contracts.
     */
    constructor(target, fqn, inner, shims) {
        this.project = target;
        this.fqn = fqn;
        this.inner = inner;
        this.shims = shims;
    }
    /** Get contract address of this contract on a particular target chain.
     * @param {Target} target - The target chain.
     * @return {ContractAddress} The contract address.
     */
    addressOn(target) {
        if (target == this.project.target()) {
            return this.inner.address;
        }
        else {
            const maybeShim = this.shims.get(target);
            if (maybeShim) {
                return maybeShim.address;
            }
            throw new Error(`Contract not deployed on ${target}`);
        }
    }
    /** Get contract address on the native target chain.
     * @return {ContractAddress} The contract address.
     */
    address() {
        return this.addressOn(this.project.target());
    }
    /**
     * Returns a promise that completes once the bridge between this contract and
     * its shims has been established. In general, you don't need to call this
     * yourself; the top-level {@link Cubist.whenBridged} does this for all contracts.
     *
     * @param {number} retries - how many times to check if the bridge has been established.
     * @param {number} delayMs - delay in milliseconds between retries.
     * @return {boolean} - whether a bridge has been established within the given time parameters.
     */
    async whenBridged(retries = 100, delayMs = 100) {
        // contracts without shims need no bridging
        if (this.shims.size == 0) {
            return true;
        }
        const tryIsFile = (p) => {
            try {
                return (0, fs_1.statSync)(p).isFile();
            }
            catch {
                return false;
            }
        };
        const bridgedPath = this.deploymentManifestBridgedPath();
        for (let i = 0; i < retries; i++) {
            if (tryIsFile(bridgedPath)) {
                return true;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return false;
    }
    /**
     * @internal
     * Creates a manifest for this contract and saves it to disk (in the {@link
     * Config.deploy_dir} directory).
     */
    async saveDeploymentManifest() {
        const dm = {
            contract: this.fqn,
            target: this.project.target(),
            address: this.inner.address,
            shims: [...this.shims].map((x) => ({
                target: x[0],
                address: x[1].address,
            })),
        };
        // Manifest path: deploy/cubist-deploy/{contract_name}-{address}.json
        const manifestPath = this.deploymentManifestPath();
        await writeAtomic(dm, manifestPath);
    }
    /** @internal
     * @return {PathBuf} - Directory where deployment manifest files are to be written.
     * */
    deploymentManifestDir() {
        return path.join(this.project.config.deploy_dir(), 'cubist-deploy');
    }
    /** @internal
     * @return {PathBuf} - File stem of the deployment manifest file
     * */
    deploymentManifestStem() {
        return `${this.fqn.name}-${this.inner.address}`;
    }
    /** @internal
     * @return {PathBuf} - Full path to the deployment manifest file
     * */
    deploymentManifestPath() {
        return path.join(this.deploymentManifestDir(), `${this.deploymentManifestStem()}.json`);
    }
    /** @internal
     * @return {PathBuf} - Full path to the file indicating that the deployment
     * has been bridged
     * */
    deploymentManifestBridgedPath() {
        return path.join(this.deploymentManifestDir(), `${this.deploymentManifestStem()}.bridged`);
    }
}
exports.Contract = Contract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3ViaXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2N1YmlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1DRztBQUNILDJDQUE2QjtBQUU3QiwwQ0FBd0Q7QUFDeEQsMkJBQStCO0FBRS9CLHFDQU1rQjtBQUNsQix5Q0FBNEM7QUFnQjVDLDJDQUF5QjtBQUN6QixzQkFBc0I7QUFDdEIsdURBQXVDO0FBQ3ZDLGtCQUFrQjtBQUNsQix1Q0FBd0M7QUFBL0IscUdBQUEsU0FBUyxPQUFBO0FBQ2xCLHNCQUFzQjtBQUN0Qix1Q0FBdUM7QUFBOUIsb0dBQUEsUUFBUSxPQUFBO0FBTWpCLGNBQWM7QUFDZCxpQ0FBcUM7QUFBNUIsa0dBQUEsU0FBUyxPQUFBO0FBNkJsQjs7Ozs7TUFLTTtBQUNOLEtBQUssVUFBVSxXQUFXLENBQUMsRUFBc0IsRUFBRSxZQUFxQjtJQUN0RSxNQUFNLElBQUEsZ0JBQUssRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7SUFDOUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxZQUFZLE1BQU0sQ0FBQztJQUN2QyxNQUFNLElBQUEsb0JBQVMsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsTUFBTSxJQUFBLGlCQUFNLEVBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlERztBQUNILE1BQWEsTUFBTTtJQVlqQjs7Ozs7Ozs7Ozs7Ozs7OztTQWdCSztJQUNMLFlBQVksTUFBZTtRQUN6QixJ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