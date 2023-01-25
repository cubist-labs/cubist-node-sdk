"use strict";
/**
 * This module exports the {@link TargetProject} class, which abstracts over
 * single-chain projects, and aliases we export from
 * [ethers.js](https://docs.ethers.io/v5/) (e.g., {@link Contract}s and
 * {@link BigNumber}s).
 *
 * This module is internal to Cubist and is likely to change in the future.
 *
 * @module
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.genTypes = exports.TargetProject = exports.BigNumber = exports.solidity = void 0;
const config_1 = require("../config");
const solidity = __importStar(require("./target_handler/solidity"));
exports.solidity = __importStar(require("./target_handler/solidity"));
/** ethers.js' BigNumber */
var solidity_1 = require("./target_handler/solidity");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return solidity_1.BigNumber; } });
/**
 * Project encapsulating all contracts and contract factories for a particular
 * target chain. This class largely abstracts over any particular chain
 * details; instead all the hard work is done by `TargetProjectHandler`s. We
 * currently only have a handler for Solidity projects, but we plan to add
 * support for other languages in the future and will make the handler
 * interface public so the community can add handlers to different kinds of
 * projects.
 *
 * This class is largley internal and will likely not be exposed in future
 * versions. The only user-facing methods for now are for getting information
 * from the project node (e.g., accounts, balances, etc.).
 *
 * @group Advanced
 */
class TargetProject {
    /** @internal Create new project per target
     * @param {Target} target - The target chain
     * @param {Config?} config - Optional config (using near otherwise).
     */
    constructor(target, config) {
        this._target = target;
        this.config = config ?? config_1.Config.nearest();
        const target_config = this.config.contracts().targets.get(target);
        if (!target_config) {
            throw new Error(`Target '${target}' not found in config`);
        }
        if (target_config.compiler == config_1.Compiler.Solc) {
            this.handler = new solidity.Handler(this);
        }
        else {
            throw new Error(`Unsupported '${target_config.compiler}' projects`);
        }
    }
    /** @return {Target} - The target chain */
    target() {
        return this._target;
    }
    /** @internal Get contract factory.
     * @param {ContractName} name - The contract name.
     * @return {ContractFactory} The contract factory.
     * */
    getContractFactory(name) {
        return this.handler.getContractFactory(name);
    }
    /** @internal Get deployed contract.
     * @param {ContractName} name - The contract name.
     * @param {ContractAddress?} addr - Optional contract address (if more than
     * one contract with same name).
     * @param {boolean} ignoreReceipt - Ignore receipt (e.g., if contract deployed
     * with another tool).
     * @return {Contract} The contract.
     * @throws {Error} If the contract could not be found, if there are multiple
     * contracts and the address argument is omitted, or if the receipt is missing
     * (unless ignoreReceipt is set).
     * */
    getContract(name, addr, ignoreReceipt = false) {
        return this.getNamedContract(name, addr, ignoreReceipt).inner;
    }
    /** @internal Get deployed named contract.
      * @param {ContractName} name - The contract name.
      * @param {ContractAddress?} addr - Optional contract address (if more than
      * one contract with same name).
      * @param {boolean} ignoreRec - Ignore receipt (e.g., if contract deployed
      * with another tool).
      * @return {NamedContract} The contract.
      * @throws {Error} If the contract could not be found, if there are multiple
      * contracts and the address argument is omitted, or if the receipt is missing
      * (unless ignoreReceipt is set).
      * */
    getNamedContract(name, addr, ignoreRec = false) {
        return this.handler.getNamedContract(name, addr, ignoreRec);
    }
    /** Check if contract has been deployed.
    * @param {ContractName} name - The contract name.
    * @return {boolean} true if contract was deployed at least once.
    * */
    isDeployed(name) {
        return this.handler.isDeployed(name);
    }
    /** Retrieve all accounts used on this target.
     * @return {Promise<Address[]>} Accounts.
     */
    accounts() {
        return this.handler.accounts();
    }
    /** Return default signer address (`accounts[0]`) for now.
     * @return {Promise<Address>} Default signer address. */
    getSignerAddress() {
        return this.handler.getSignerAddress();
    }
    /** Get the balance of the given address.
      * @param {Address} addr - The address.
      * @return {Promise<BigNumber>} The balance. */
    getBalance(addr) {
        return this.handler.getBalance(addr);
    }
}
exports.TargetProject = TargetProject;
/**
 * @internal Generate TypeScript types for given project (or nearest). You
 * don't generally need to call this directly. The `cubist build` command does
 * it for you (via the `cubist gen` command).
 * @param {string?} file - Optional config file path; otherwise, use nearest config.
 */
async function genTypes(file) {
    const cfg = file ? config_1.Config.from_file(file) : config_1.Config.nearest();
    if (cfg.type === config_1.ProjType.TypeScript) {
        console.log('Generating TypeScript types...');
        await cfg.generate_types();
    }
}
exports.genTypes = genTypes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxzQ0FNbUI7QUFVbkIsb0VBQXNEO0FBQ3RELHNFQUFzRDtBQUd0RCwyQkFBMkI7QUFDM0Isc0RBQXVEO0FBQTlDLHFHQUFBLFNBQVMsT0FBQTtBQVNsQjs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQWEsYUFBYTtJQU14Qjs7O09BR0c7SUFDSCxZQUFZLE1BQWMsRUFBRSxNQUFlO1FBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLGVBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsTUFBTSx1QkFBdUIsQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsSUFBSSxhQUFhLENBQUMsUUFBUSxJQUFJLGlCQUFRLENBQUMsSUFBSSxFQUFFO1lBQzNDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixhQUFhLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQztTQUNyRTtJQUNILENBQUM7SUFFRCwwQ0FBMEM7SUFDbkMsTUFBTTtRQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztTQUdLO0lBQ0wsa0JBQWtCLENBQUMsSUFBa0I7UUFDbkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7Ozs7OztTQVVLO0lBQ0wsV0FBVyxDQUFDLElBQWtCLEVBQUUsSUFBc0IsRUFBRSxhQUFhLEdBQUcsS0FBSztRQUMzRSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNoRSxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7VUFVTTtJQUNOLGdCQUFnQixDQUFDLElBQWtCLEVBQUUsSUFBc0IsRUFBRSxTQUFTLEdBQUcsS0FBSztRQUM1RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7OztRQUdJO0lBQ0osVUFBVSxDQUFDLElBQWtCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7NERBQ3dEO0lBQ3hELGdCQUFnQjtRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7b0RBRWdEO0lBQ2hELFVBQVUsQ0FBQyxJQUFvQjtRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FDRjtBQS9GRCxzQ0ErRkM7QUFFRDs7Ozs7R0FLRztBQUNJLEtBQUssVUFBVSxRQUFRLENBQUMsSUFBYTtJQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3RCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssaUJBQVEsQ0FBQyxVQUFVLEVBQUU7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQzVCO0FBQ0gsQ0FBQztBQU5ELDRCQU1DIn0=