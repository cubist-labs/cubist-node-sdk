import { PathBuf } from './config';
/** @internal
 * Find file starting from directory.
 * @param {PathBuf} name Config filename.
 * @param {PathBuf} dir starting directory
 * @return {PathBuf} the file path.
 * @throws {FileNotFound} if no file is found.
 */
export declare function find_file(name: PathBuf, dir: PathBuf): PathBuf;
