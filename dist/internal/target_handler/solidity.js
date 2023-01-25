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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = exports.BigNumber = void 0;
/**
 * This module implements the target handler for Solidity contracts. The code
 * in this module is internal to Cubist and likely to change as we add support
 * for other contract languages. The only non-internal exports are aliases to
 * [ethers.js](https://docs.ethers.io/v5/)'s types.
 *
 * @module
 */
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const promises_1 = require("fs/promises");
const ethers_1 = require("ethers");
const _1 = require("./");
/** Big numbers use by our contracts are ethers.js' BigNumber. */
var ethers_2 = require("ethers");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return ethers_2.BigNumber; } });
/** @internal Contract factory implementation for Solidity projects. */
class ContractFactory {
    /** Create new contract factory.
     * @param {Artifact} art - The contract artifact.
     * @param {Options?} options - Optional arguments.
     */
    constructor(art, options) {
        this.artifact = art;
        this.saveReceipt = options?.saveReceipt;
        this.ethersFactory = new ethers_1.ethers.ContractFactory(art.abi, art.bytecode, options?.signer);
    }
    /** @return {ContractFQN} fully qualified contract name */
    fqn() {
        return this.artifact.fqn;
    }
    /** Deploy contract and save receipts to disk.
     * @param {Array<any>} args - The constructor arguments.
     * @return {Promise<Contract>} The deployed contract.
     * @throws {Error} If the contract could not be deployed.
     */
    async deploy(...args) {
        // deploy contract
        const contract = await this.ethersFactory.deploy(...args);
        // wait for receipt
        const receipt = await contract.deployTransaction.wait();
        // save receipt
        if (this.saveReceipt) {
            await this.saveReceipt(receipt);
        }
        return contract;
    }
}
/** @internal The project handler for Solidity projects. */
class Handler extends _1.TargetProjectHandler {
    /** Create new project handler.
     * @param {TargetProject} project - The project to handle.
     */
    constructor(project) {
        super(project);
        this.net_cfg = project.config.network_for_target(project.target());
        if (!this.net_cfg) {
            throw new Error(`Missing network configuration for target '${project.target()}'`);
        }
        const url = this.net_cfg.proxy ?
            `http://localhost:${this.net_cfg.proxy.port}` :
            this.net_cfg.url.toString();
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(url);
    }
    /** Get ethers ContractFactory for the given contract name. We assume that
     * there is only one contract with the given name for each project (target).
     * @param {ContractName} name - The contract name.
     * @return {ContractFactory} The contract factory.
     * @throws {Error} If the contract factory cannot be found.
     * */
    getContractFactory(name) {
        const artifact = this.getBuildArtifact(name);
        const signer = this.getSigner();
        const saveReceipt = async (receipt) => {
            await this.saveDeployReceipt(name, receipt);
        };
        return new ContractFactory(artifact, { signer, saveReceipt, });
    }
    /** Save the deployment receipt to disk.
     * We save receipts in:
     * <deploy_dir>/<target>/<current_network_profile>/<contract_name>/<contract_address>.json
     * @param {ContractName} name - The contract name.
     * @param {ContractReceipt} receipt - The contract receipt.
     */
    async saveDeployReceipt(name, receipt) {
        const proj = this.project;
        // Create deploy/current-network-profile/target/contract-name
        const deploy_dir = path.join(proj.config.deploy_dir(), proj.target(), proj.config.current_network_profile, name);
        await (0, promises_1.mkdir)(deploy_dir, { recursive: true, });
        // The file name is the contract address (since we might deploy multiple
        // contracts with the same name)
        const file_name = `${receipt.contractAddress}.json`;
        // Write receipt to file
        await (0, promises_1.writeFile)(path.join(deploy_dir, file_name), JSON.stringify(receipt, null, 2));
    }
    /** Get deployed contract.
    * @param {ContractName} name - The contract name.
    * @param {Address?} addr - Optional contract address (if more than one
    * contract with same name).
    * @param {boolean} ignoreReceipt - Ignore receipt (e.g., if contract deployed
    * with another tool).
    * @return {NamedContract} The contract and its name.
    * @throws {Error} If the contract could not be found, if there are multiple
    * contracts and the address argument is omitted, or if the receipt is missing
    * (unless ignoreReceipt is set).
    * */
    getNamedContract(name, addr, ignoreReceipt = false) {
        // Get the artifact (throws if we didn't build the contract)
        const artifact = this.getBuildArtifact(name);
        // Find the contract address in the deploy directory
        const proj = this.project;
        // Get the contract deploy dir
        const deploy_dir = path.join(proj.config.deploy_dir(), proj.target(), proj.config.current_network_profile, name);
        if (!addr) {
            // Get deploy receipt(s)
            const files = fs.existsSync(deploy_dir) ? fs.readdirSync(deploy_dir) : [];
            if (files.length === 0) {
                throw new Error(`Could not find deploy receipts for contract '${name}' on '${proj.target()}'.`);
            }
            if (files.length > 1) {
                throw new Error(`More than one contract '${name}' found on '${proj.target()}' in '${deploy_dir}': ${files}`);
            }
            // get address by reading the receipt (even though for now the file name has the address)
            const receipt = JSON.parse(fs.readFileSync(path.join(deploy_dir, files[0]), 'utf8'));
            addr = receipt.contractAddress;
        }
        else {
            if (!ethers_1.ethers.utils.isAddress(addr)) {
                throw new Error(`Invalid contract address '${addr}'`);
            }
            if (!ignoreReceipt) {
                // get receipt (assuming contract was deployed using our tooling)
                const receipt_file = path.join(deploy_dir, `${addr}.json`);
                if (!fs.existsSync(receipt_file)) {
                    throw new Error(`Could not find deploy receipt for contract '${name}' on '${proj.target()}' at address '${addr}'.`);
                }
                // Read receipt and double check address
                const receipt = JSON.parse(fs.readFileSync(receipt_file, 'utf8'));
                if (addr !== receipt.contractAddress) {
                    throw new Error(`Unexpected: Bad receipt for contract '${name}' on '${proj.target()}' at address '${addr}'. Please report this bug.`);
                }
            }
        }
        return {
            fqn: artifact.fqn,
            inner: new ethers_1.ethers.Contract(addr, artifact.abi, this.getSigner()),
        };
    }
    /** Check if contract has been deployed.
    * @param {ContractName} name - The contract name.
    * @return {boolean} true if contract was deployed at least once.
    * */
    isDeployed(name) {
        // Find the contract address in the deploy directory
        const proj = this.project;
        // Get the contract deploy dir
        const deploy_dir = path.join(proj.config.deploy_dir(), proj.target(), proj.config.current_network_profile, name);
        // Get deploy receipt(s)
        const files = fs.existsSync(deploy_dir) ? fs.readdirSync(deploy_dir) : [];
        return (files.length > 0);
    }
    /** Get build artifact for the given contract name.
     * TODO: make sure the JSON is valid.
     * @param {ContractName} name - The contract name.
     * @return {JSON} The build artifact.
     */
    getBuildArtifact(name) {
        const proj = this.project;
        // make sure the artifacts are built
        const artifacts_dir = path.join(proj.config.build_dir(), proj.target(), 'artifacts');
        if (!fs.existsSync(artifacts_dir)) {
            throw new Error(`Artifacts directory '${artifacts_dir}' does not exist. Did you run 'cubist build'?`);
        }
        // find the contract (${name}.json) in one of the *.sol directories
        const artifacts = fs.readdirSync(artifacts_dir);
        for (const sol_dir of artifacts) {
            const json_files = fs.readdirSync(path.join(artifacts_dir, sol_dir));
            const contract_file = `${name}.json`;
            if (json_files.indexOf(contract_file) >= 0) {
                const contract_file_path = path.join(artifacts_dir, sol_dir, contract_file);
                const fqn = { file: sol_dir, name: name, };
                const json = JSON.parse(fs.readFileSync(contract_file_path, 'utf8'));
                // TODO validate the json
                return {
                    fqn: fqn,
                    abi: json.abi,
                    bytecode: json.bytecode,
                };
            }
        }
        throw new Error(`Could not find artifact for ${name} on ${proj.target()}.`);
    }
    /** Get signer for the current network profile.
     * If not address or account index is provided, we use first account.
     * We'll want to change this to use different accounts for deployment, etc.
     * @param {string | number} addressOrIndex - Optional account index or address.
     * @return {Signer} The signer.
     */
    getSigner(addressOrIndex) {
        const account = addressOrIndex ?? /* account @ index */ 0;
        return this.provider.getSigner(account);
    }
    /** Retrieve all accounts used on this target.
     * @return {Promise<Address[]>} Accounts.
     */
    accounts() {
        return this.provider.listAccounts();
    }
    /** Return default signer address.
     * @return {Promise<Address>} Default signer address. */
    getSignerAddress() {
        return this.getSigner().getAddress();
    }
    /** Get the balance of the given address.
      * @param {Address} addr - The address.
      * @return {Promise<BigNumber>} The balance. */
    getBalance(addr) {
        return this.provider.getBalance(addr);
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29saWRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW50ZXJuYWwvdGFyZ2V0X2hhbmRsZXIvc29saWRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7OztHQU9HO0FBQ0gsMkNBQTZCO0FBQzdCLHVDQUF5QjtBQUN6QiwwQ0FBZ0Q7QUFDaEQsbUNBQTRDO0FBRTVDLHlCQUdZO0FBY1osaUVBQWlFO0FBQ2pFLGlDQUFvQztBQUEzQixtR0FBQSxTQUFTLE9BQUE7QUE4QmxCLHVFQUF1RTtBQUN2RSxNQUFNLGVBQWU7SUFLbkI7OztPQUdHO0lBQ0gsWUFBWSxHQUFhLEVBQUUsT0FBZ0M7UUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxlQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVELDBEQUEwRDtJQUMxRCxHQUFHO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFnQjtRQUU5QixrQkFBa0I7UUFDbEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzFELG1CQUFtQjtRQUNuQixNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4RCxlQUFlO1FBQ2YsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BC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