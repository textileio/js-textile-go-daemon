import path from 'path'
import Wallet from '@textile/wallet'
import Daemon, { InitOptions, StartOptions } from './daemon'

export { default as Daemon } from './daemon'

const defaultOptions = {
  disposable: true,
  start: true,
  init: true,
}

export interface SpawnOptions {
  init?: boolean // Should the node be initialized.
  initOpts?: InitOptions & { seed: string } // Seed is required if init is true
  start?: boolean // Should the node be started.
  startOpts?: StartOptions
  repoPath?: string // The repository path to use for this node, ignored if node is disposable. Will be used instead of initOpts or startOpts versions.
  disposable?: boolean // A new repo is created and initialized for each invocation, as well as cleaned up automatically once the process exits.
  env?: Record<string, string> // Additional environment variables, passed to executing shell.
}

/**
 * Creates an instance of FactoryDaemon.
 *
 * @param exec The path of the daemon executable
 */
export class DaemonFactory {
  exec?: string
  constructor(exec?: string) {
    this.exec = exec
  }

  /**
   * Spawn a Textile Node.
   *
   * @param options Various config options and ipfs config parameters
   */
  async spawn(opts: SpawnOptions = defaultOptions) {
    opts = Object.assign(defaultOptions, opts)
    opts.init = Boolean(opts.init)

    if (!opts.disposable) {
      opts.init = false
      opts.start = false

      const defaultRepo = path.join(process.env.HOME || process.env.USERPROFILE || '~', '.textile', 'repo')
      opts.repoPath = opts.repoPath || (process.env.TEXTILE_PATH || defaultRepo)
    }

    const node = new Daemon(this.exec, opts.disposable, opts.repoPath, opts.env)

    if (opts.init) {
      const seed = opts.initOpts
        ? opts.initOpts.seed
        : Wallet.fromEntropy()
            .accountAt(0)
            .keypair.secret()
      try {
        await node.init(seed, opts.initOpts)
      } catch (err) {
        throw new Error('Unable to initialize node. Does the path exist?')
      }
    }

    if (opts.start) {
      try {
        await node.start(opts.startOpts)
      } catch (err) {
        throw new Error('Unable to start node. Was the repo properly initialized?')
      }
    }

    return node
  }
}

/**
 * Create and spawn a Textile Daemon
 *
 * @param exec Textile executable path. Will attempt to locate it by default.
 */
const spawn = async (exec?: string, opts?: SpawnOptions) => {
  return new DaemonFactory(exec).spawn(opts)
}

export default spawn
