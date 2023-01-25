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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.find_file = void 0;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("./config");
/** @internal
 * Find file starting from directory.
 * @param {PathBuf} name Config filename.
 * @param {PathBuf} dir starting directory
 * @return {PathBuf} the file path.
 * @throws {FileNotFound} if no file is found.
 */
function find_file(name, dir) {
    const candidate = path_1.default.join(dir, name);
    // is candidate a file
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }
    const parentDir = path_1.default.join(dir, '..');
    // If we're at the root, throw an error
    if (parentDir === dir) {
        throw new config_1.FileNotFound(name);
    }
    return find_file(name, parentDir);
}
exports.find_file = find_file;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnREFBd0I7QUFDeEIsdUNBQXlCO0FBQ3pCLHFDQUFrRDtBQUVsRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixTQUFTLENBQUMsSUFBYSxFQUFFLEdBQVk7SUFDbkQsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsc0JBQXNCO0lBQ3RCLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQy9ELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFdkMsdUNBQXVDO0lBQ3ZDLElBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtRQUNyQixNQUFNLElBQUkscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtJQUVELE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBZkQsOEJBZUMifQ==