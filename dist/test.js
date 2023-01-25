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
exports.ConfigTestDK = exports.CubistTestDK = exports.TestDK = exports.Service = void 0;
/**
 * This module exports a simple testing framework.
 *
 * Specifically, it exposes the {@link TestDK} class (and its more specific
 * variant {@link CubistTestDK}) which abstracts over a {@link cubist.Cubist}
 * project's testing infrastructure. {@link TestDK} can be used to:
 *
 * - {@link TestDK.startService | Start} and {@link TestDK.stopService | stop}
 *   local [chains and
 *   relayer](/guide/quick-start#start-cubist-chains-and-relayer), e.g., before
 *   and, respectively, after running tests.
 * - {@link TestDK.build | Build} your app, much like [cubist
 *   build](/guide/quick-start#build-the-app)
 * - Test projects in fresh (temporary) `build` and `deploy` directories.
 *
 * {@link TestDK} can be used for testing well-typed [CubistORM] projects too
 * (see [Overview](../)).
 *
 * [CubistORM]: /jsdoc-md/cubist.CubistORM
 *
 * @module
 */
const config_1 = require("./config");
const cubist_1 = require("./cubist");
const path = __importStar(require("path"));
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const child_process_1 = require("child_process");
const which_1 = require("which");
const fs_1 = require("fs");
/**
 * Cubist service we can start/stop.
 *
 * @group Testing
 * */
var Service;
(function (Service) {
    /** All target chains */
    Service["Chains"] = "chains";
    /** Relayer */
    Service["Relayer"] = "relayer"; // eslint-disable-line no-unused-vars
})(Service = exports.Service || (exports.Service = {}));
/**
 * Class that abstracts over a Cubist project's testing process. In particular,
 * this class makes it possible to (1) create {@link cubist.Cubist} (or
 * [CubistORM]) projects with temporary build and deploy directories and (2)
 * start and stop {@link Service | services} when running tests.
 *
 * @example
 *
 * Using {@link TestDK} to test [CubistORM] projects with
 * [Jest](https://jestjs.io/). The `cubist build` command generates [CubistORM]
 * at build time; this class extends {@link cubist.Cubist} with
 * project-specific contracts (see the [Overview](/jsdoc)).
 *
 * ```typescript
 * import { TestDK, } from '@cubist-labs/cubist';
 * import { CubistORM } from '../build/orm';
 *
 * const testdk = new TestDK<CubistORM>(CubistORM, { tmp_deploy_dir: true });
 *
 * beforeAll(async () => {
 *   await testdk.startService();
 * });
 *
 * afterAll(async () => {
 *   await testdk.stopService();
 * });
 *
 * beforeEach(async () => {
 *   await testdk.emptyDeployDir();
 * });
 *
 *
 * // get the project under test
 * const cubist = testdk.cubist;
 *
 * // .. use cubist to get contracts and contract factories, as usual ...
 * ```
 *
 * In this example, we create a new testing [CubistORM] project whose `deploy`
 * directory is set to a new temporary directory. This lets you test your
 * project without clobbering existing deploy receipts.
 *
 * We start services---chains and relayer---before all tests, and stop them at
 * the end.
 *
 * We also empty the `deploy` directory before each test.
 *
 * [CubistORM]: /jsdoc-md/cubist.CubistORM
 *
 * @group Testing
 * */
class TestDK {
    /** Create new instance of TestDK.
     *
     * @example
     * Testing project in fresh deploy directory.
     * ```typescript
     * const testdk = new TestDK<CubistORM>(CubistORM, { tmp_deploy_dir: true });
     * ```
     *
     * @example
     * Testing project in fresh build and deploy directory.
     * ```typescript
     * const testdk = new TestDK<Cubist>(Cubist, { tmp_build_dir: true, tmp_deploy_dir: true });
     *
     * beforeAll(async () => {
     *   // build the project
     *   await testdk.build();
     *   // start chains and relayer
     *   await testdk.startService();
     * });
     * ```
     *
     * @example
     * Testing already-built (and deployed) project.
     * ```typescript
     * const testdk = new TestDK<Cubist>(Cubist);
     * ```
     *
     * @param {CubistClassRef<T>} CubistX - Reference to Cubist class.
     * @param {TestDKOptions?} options? - Options for creating instance.
     */
    constructor(CubistX, options) {
        if (options?.args) {
            this._cubist = new CubistX(...options.args);
        }
        else {
            this._cubist = new CubistX();
        }
        this._config = this._cubist.config;
        if (options?.tmp_build_dir) {
            const tmp = (0, fs_1.mkdtempSync)(path.join((0, os_1.tmpdir)(), 'cubist-node-sdk-test-build-'));
            this._config.__set_build_dir(tmp);
            this.custom_build_dir = tmp;
        }
        if (options?.tmp_deploy_dir) {
            const tmp = (0, fs_1.mkdtempSync)(path.join((0, os_1.tmpdir)(), 'cubist-node-sdk-test-deploy-'));
            this._config.__set_deploy_dir(tmp);
            this.custom_deploy_dir = tmp;
        }
        this.services = null;
    }
    /** Get the cubist project we're testing.
     *
     * ::: warning
     * Whenever you use {@link TestDK}, you should always use this
     * accessors to get a reference to the {@link cubist.Cubist} project.
     * Creating a new {@link cubist.Cubist} object could have unwanted behavior.
     * Here is an example how things can go wrong:
     * :::
     *
     * ```typescript
     * const testdk = new TestDK<CubistORM>(CubistORM, { tmp_deploy_dir: true });
     * const cubist = testdk.cubist; // this is correct
     *
     * const bad_cubist = new Cubist(); // this is not what you want; the deploy
     * // directory for this project is the deploy directory specified in the config
     * // that is:
     * assert(cubist.config.build_dir() != bad_cubist.config.build_dir());
     * ```
     *
     * */
    get cubist() {
        return this._cubist;
    }
    /** Get the underlying config. */
    get config() {
        return this._config;
    }
    /** Execute cubist command with given args. The cubist executable itself can
     * be set by setting the CUBIST_BIN environment variable.
     * @param {string} cmd - Command to execute.
     * @param {string[]} args? - Optional arguments to pass to command.
     * @return {Promise<ChildProcess>} - Promise that resolves to child process.
     */
    async cubistExec(cmd, args) {
        const config_file = this._config.config_path;
        const options = { stdio: 'inherit', env: { ...process.env, }, };
        if (this.custom_build_dir) {
            options.env.CUBIST_BUILD_DIR = this.custom_build_dir;
        }
        if (this.custom_deploy_dir) {
            options.env.CUBIST_DEPLOY_DIR = this.custom_deploy_dir;
        }
        const cubist_exe = process.env.CUBIST_BIN ??
            (0, which_1.sync)('cubist', { nothrow: true, }) ?? 'cubist';
        const child = (0, child_process_1.spawn)(cubist_exe, [cmd, '--config', config_file, ...args || []], options);
        return new Promise((resolve, reject) => {
            child.on('error', reject);
            child.on('exit', (code) => {
                if (code === 0) {
                    resolve(child);
                }
                else {
                    reject(new Error(`cubist exited with code ${code}`));
                }
            });
        });
    }
    /**
     * Start particular service (or all)---namely [chains and
     * relayer](/guide/quick-start#start-cubist-chains-and-relayer)---with
     * [`cubist start`](/guide/cli#cubist-start).
     *
     * @param {Service?} service - Service to start.
     */
    async startService(service) {
        if (service) {
            // initialize services if not already done
            if (this.services === null) {
                this.services = new Map();
            }
            if (!(this.services instanceof Map) || this.services.has(service)) {
                throw new Error(`Cannot start service ${service}; already started.`);
            }
            this.services.set(service, await this.cubistExec('start', [service]));
        }
        else {
            if (this.services !== null) {
                throw new Error('Cannot start all services; already started.');
            }
            this.services = await this.cubistExec('start');
        }
    }
    /**
     * Stop particular service (or all)---namely [chains and
     * relayer](/guide/quick-start#start-cubist-chains-and-relayer)---with
     * [`cubist start`](/guide/cli#cubist-start).
     *
     * @param {Services?} service - Service to stop.
     */
    async stopService(service) {
        if (service) {
            if (this.services instanceof Map && this.services.has(service)) {
                // we can be more permissive and stop a particular service even if we
                // started all services, but no need to make this more complex for now.
                await this.cubistExec('stop', [service]);
                this.services.delete(service);
            }
        }
        else {
            await this.cubistExec('stop');
            this.services = null;
        }
    }
    /** Build project, i.e., run [`cubist build`](/guide/cli#cubist-build) */
    async build() {
        await this.cubistExec('build');
    }
    /** Clobber the project deploy directory. */
    async emptyDeployDir() {
        await (0, fs_extra_1.emptyDir)(this._config.deploy_dir());
    }
    /**
     * Stop service(s) on process exit.
     * @param {Services?} service - Service to stop.
     */
    stopServiceOnExit(service) {
        const stop = () => {
            this.stopService(service).catch(console.error);
        };
        process.on('exit', stop);
        process.on('SIGINT', stop);
        process.on('SIGUSR1', stop);
        process.on('SIGUSR2', stop);
        process.on('SIGTERM', stop);
        process.on('uncaughtException', stop);
    }
}
exports.TestDK = TestDK;
/**
 * Wrapper for {@link TestDK} specific to {@link cubist.Cubist}, eliding the
 * need for (1) a type parameter and (2) passing {@link cubist.Cubist} as an
 * argument.
 *
 * @example
 * Testing already-built (and deployed) project.
 * ```typescript
 * const testdk = new CubistTestDK();
 * ```
 *
 * @group Testing
 */
class CubistTestDK extends TestDK {
    /** Create new instance of CubistTestDK.
     * @param {TestDKOptions?} options? - Options for creating instance.
     **/
    constructor(options) {
        super(cubist_1.Cubist, options);
    }
}
exports.CubistTestDK = CubistTestDK;
/** @internal Class for testing the Config class. This only extends Cubist to
 * make type checker happy; it doesn't actually use any of the Cubist
 * functionality.
 */
class TestCubistConfig extends cubist_1.Cubist {
    /** Create new instance of TestCubistConfig.
     * @param {Config} config - Config to test.
     **/
    constructor(config) {
        super(config);
    }
}
/** @internal Wrapper for TestDK specific to Config. */
class ConfigTestDK extends TestDK {
    /** Create a new ConfigTestDK instance.
     * @param {string} file - Path to config file.
     * @param {ConfigTestDKOptions?} options - Options for creating instance.
     */
    constructor(file, options) {
        const cfg = config_1.Config.from_file(file);
        super(TestCubistConfig, { args: [cfg], ...options, });
    }
}
exports.ConfigTestDK = ConfigTestDK;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNILHFDQUFtQztBQUNuQyxxQ0FBbUM7QUFDbkMsMkNBQTZCO0FBQzdCLHVDQUFxQztBQUNyQywyQkFBNkI7QUFDN0IsaURBQW1FO0FBQ25FLGlDQUF1QztBQUN2QywyQkFBa0M7QUFnQmxDOzs7O0tBSUs7QUFDTCxJQUFZLE9BS1g7QUFMRCxXQUFZLE9BQU87SUFDakIsd0JBQXdCO0lBQ3hCLDRCQUFpQixDQUFBO0lBQ2pCLGNBQWM7SUFDZCw4QkFBbUIsQ0FBQSxDQUFDLHFDQUFxQztBQUMzRCxDQUFDLEVBTFcsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBS2xCO0FBV0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBa0RLO0FBQ0wsTUFBYSxNQUFNO0lBVWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTZCRztJQUNILFlBQVksT0FBMEIsRUFBRSxPQUF1QjtRQUM3RCxJQUFJLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QzthQUFNO1lBQ0wsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1NBQzlCO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUU7WUFDMUIsTUFBTSxHQUFHLEdBQUcsSUFBQSxnQkFBVyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFNLEdBQUUsRUFBRSw2QkFBNkIsQ0FB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