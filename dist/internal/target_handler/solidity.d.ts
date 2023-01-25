import { ethers, BigNumber } from 'ethers';
import { TargetProject } from '../';
import { TargetProjectHandler, ContractFactory as ProjectFactory } from './';
import { ContractName } from '../../config';
import { ContractFQN } from '../..';
/** Addresses in Solidity are just strings. */
export type Address = string;
export type ContractInterface = ethers.ContractInterface;
export type BytesLike = ethers.BytesLike;
export type Signer = ethers.Signer;
export type ContractReceipt = ethers.ContractReceipt;
/** Big numbers use by our contracts are ethers.js' BigNumber. */
export { BigNumber, } from 'ethers';
/** @internal Type for custom save-receipt functions */
export type SaveReceiptFunction = (receipt: ContractReceipt) => Promise<void>;
/** Type alias for the internal ethers Contract type */
export type Contract = ethers.Contract;
/** @internal Type that extends the internal ethers Contract type with a fully
* qualified name. */
export interface NamedContract {
    /** Fully qualified name */
    fqn: ContractFQN;
    /** Inner ethers contract */
    inner: Contract;
}
/** @internal Contract factory optional arguments. */
export interface ContractFactoryOptions {
    signer?: Signer;
    saveReceipt?: SaveReceiptFunction;
}
/** @internal Artifact type */
interface Artifact {
    fqn: ContractFQN;
    abi: ContractInterface;
    bytecode: BytesLike;
}
/** @internal Contract factory implementation for Solidity projects. */
declare class ContractFactory implements ProjectFactory {
    readonly artifact: Artifact;
    readonly ethersFactory: ethers.ContractFactory;
    saveReceipt?: SaveReceiptFunction;
    /** Create new contract factory.
     * @param {Artifact} art - The contract artifact.
     * @param {Options?} options - Optional arguments.
     */
    constructor(art: Artifact, options?: ContractFactoryOptions);
    /** @return {ContractFQN} fully qualified contract name */
    fqn(): ContractFQN;
    /** Deploy contract and save receipts to disk.
     * @param {Array<any>} args - The constructor arguments.
     * @return {Promise<Contract>} The deployed contract.
     * @throws {Error} If the contract could not be deployed.
     */
    deploy(...args: Array<any>): Promise<Contract>;
}
/** @internal The project handler for Solidity projects. */
export declare class Handler extends TargetProjectHandler {
    private net_cfg;
    private provider;
    /** Create new project handler.
     * @param {TargetProject} project - The project to handle.
     */
    constructor(project: TargetProject);
    /** Get ethers ContractFactory for the given contract name. We assume that
     * there is only one contract with the given name for each project (target).
     * @param {ContractName} name - The contract name.
     * @return {ContractFactory} The contract factory.
     * @throws {Error} If the contract factory cannot be found.
     * */
    getContractFactory(name: ContractName): ContractFactory;
    /** Save the deployment receipt to disk.
     * We save receipts in:
     * <deploy_dir>/<target>/<current_network_profile>/<contract_name>/<contract_address>.json
     * @param {ContractName} name - The contract name.
     * @param {ContractReceipt} receipt - The contract receipt.
     */
    private saveDeployReceipt;
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
    getNamedContract(name: ContractName, addr?: Address, ignoreReceipt?: boolean): NamedContract;
    /** Check if contract has been deployed.
    * @param {ContractName} name - The contract name.
    * @return {boolean} true if contract was deployed at least once.
    * */
    isDeployed(name: ContractName): boolean;
    /** Get build artifact for the given contract name.
     * TODO: make sure the JSON is valid.
     * @param {ContractName} name - The contract name.
     * @return {JSON} The build artifact.
     */
    private getBuildArtifact;
    /** Get signer for the current network profile.
     * If not address or account index is provided, we use first account.
     * We'll want to change this to use different accounts for deployment, etc.
     * @param {string | number} addressOrIndex - Optional account index or address.
     * @return {Signer} The signer.
     */
    private getSigner;
    /** Retrieve all accounts used on this target.
     * @return {Promise<Address[]>} Accounts.
     */
    accounts(): Promise<Address[]>;
    /** Return default signer address.
     * @return {Promise<Address>} Default signer address. */
    getSignerAddress(): Promise<Address>;
    /** Get the balance of the given address.
      * @param {Address} addr - The address.
      * @return {Promise<BigNumber>} The balance. */
    getBalance(addr: Address): Promise<BigNumber>;
}
