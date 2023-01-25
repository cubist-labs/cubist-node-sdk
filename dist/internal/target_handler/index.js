"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetProjectHandler = void 0;
/**
 * @internal Abstract class for handling compiler-specific artifacts.
 */
class TargetProjectHandler {
    /** Create new project handler.
     * @param {TargetProject} project - The project to handle.
     */
    constructor(project) {
        this.project = project;
    }
    /** Utility function that calls {@link getNamedContract} and
     * returns its the inner contract.
     *
     * @param {ContractName} name - The contract name.
     * @param {ContractAddress?} addr - Optional contract address (if more than
     * one contract with same name).
     * @param {boolean} ignoreReceipt - Ignore receipt (e.g., if contract deployed
     * with another tool).
     * @return {Contract} The contract with its full name.
     * @throws {Error} If the contract could not be found, if there are multiple
     * contracts and the address argument is omitted, or if the receipt is missing
     * (unless ignoreReceipt is set).
     * */
    getContract(name, addr, ignoreReceipt) {
        return this.getNamedContract(name, addr, ignoreReceipt).inner;
    }
}
exports.TargetProjectHandler = TargetProjectHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW50ZXJuYWwvdGFyZ2V0X2hhbmRsZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBb0NBOztHQUVHO0FBQ0gsTUFBc0Isb0JBQW9CO0lBR3hDOztPQUVHO0lBQ0gsWUFBWSxPQUFzQjtRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBNEJEOzs7Ozs7Ozs7Ozs7U0FZSztJQUNMLFdBQVcsQ0FBQyxJQUFrQixFQUFFLElBQXNCLEVBQUUsYUFBdUI7UUFDN0UsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDaEUsQ0FBQztDQWdCRjtBQW5FRCxvREFtRUMifQ==