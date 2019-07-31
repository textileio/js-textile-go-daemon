import { Textile } from '@textile/js-http-client'
import fs from 'fs-extra'
import debug from 'debug'
import path from 'path'
import URL from 'url-parse'
import { ExecaError, ExecaChildProcess } from 'execa'
import { tempDir, find, run } from './utils'

// const multiaddr from 'multiaddr'
// const safeStringify from 'safe-json-stringify')

const log = debug('@textile/go-daemon:daemon')
const daemonLog = {
  info: debug('@textile/go-daemon:daemon:stdout'),
  err: debug('@textile/go-daemon:daemon:stderr'),
}
// Amount of ms to wait before sigkill
const GRACE_PERIOD = 10500

// Amount of ms to wait before sigkill for non disposable repos
const NON_DISPOSABLE_GRACE_PERIOD = 10500 * 3

export interface StartOptions {
  debug?: boolean
  repoPath?: string
  pincode?: string
  serveDocs?: boolean
}

export interface InitOptions {
  // api?: TextileOptions // API Address and version to use
  debug?: boolean // Set the logging level to debug
  pincode?: string // Specify a pin for datastore encryption
  repoPath?: string // Specify a custom repository path
  server?: boolean // Apply IPFS server profile
  swarmPorts?: string[] // Set the swarm ports (TCP,WS). A random TCP port is chosen by default
  logFiles?: boolean // If true, writes logs to rolling files, if false, writes logs to stdout
  apiBindAddr?: string // Set the local API address (default: 0.0.0.0:40601)
  gatewayBinAddr?: string // Set the Textile/IPFS gateway address
  cafeBindAddr?: string // Set the cafe REST API address (default: 127.0.0.1:5050)
  profileBindAddr?: string // Set the profiling address (default: 127.0.0.1:6060)
  cafe?: boolean // Open the p2p cafe service for other peers
  cafeUrl?: string // Specify a custom URL of this cafe, e.g., https://mycafe.com
  cafeNeighborUrl?: string // Specify the URL of a secondary cafe. Must return cafe info, e.g., via a Gateway: https://my-gateway.yolo.com/cafe, or a cafe API: https://my-cafe.yolo.com
}

class Daemon {
  public readonly exec: string
  public initialized: boolean
  public api?: Textile
  public started: boolean = false
  public readonly disposable: boolean = false
  public repoPath: string

  private subprocess?: ExecaChildProcess = undefined
  private clean: boolean = false
  private _env: NodeJS.ProcessEnv | Record<string, string>

  public constructor(exec?: string, disposable?: boolean, repoPath?: string, env?: Record<string, string>) {
    const rootPath = process.env.testpath ? process.env.testpath : __dirname
    const td = tempDir()
    this.repoPath = disposable ? td : repoPath || td
    this.disposable = disposable || false

    const envExec = process.env.TEXTILE_EXEC
    this.exec = exec || envExec || find(rootPath)
    this.initialized = fs.existsSync(this.repoPath)
    this.clean = true
    this._env = Object.assign({}, process.env, env)
  }

  /**
   * Shell environment variables.
   */
  get env() {
    return this.repoPath ? Object.assign({}, this._env, { TEXTILE_PATH: this.repoPath }) : this._env
  }

  /**
   * Configure textile to use the account by creating a local repository to house its data.
   *
   * @param seed The account seed to use, if you do not have one, use @textile/wallet to create/derive one.
   * @param opts Set of options to use when initializing the textile repo.
   * @param flags Additional array of command-line flags to be passed to the `textile init` command.
   */
  async init(seed: string, opts: InitOptions = {}, flags?: string[]) {
    if (opts.repoPath && opts.repoPath !== this.repoPath) {
      this.repoPath = opts.repoPath
    }

    let args = ['init', seed]
    if (opts.debug) {
      args.push('--debug')
    }
    if (opts.pincode) {
      args.push('--pin')
      args.push(`"${opts.pincode}"`)
    }
    if (this.repoPath) {
      args.push('--repo')
      args.push(path.resolve(this.repoPath))
    }
    if (opts.server) {
      args.push('--server')
    }
    if (opts.swarmPorts) {
      args.push('--swarm-ports')
      args.push(path.resolve(opts.swarmPorts.join(',')))
    }
    if (opts.logFiles) {
      args.push('--log-files')
    }
    if (opts.apiBindAddr) {
      args.push('--api-bind-addr')
      args.push(`"${opts.apiBindAddr}"`)
    }
    if (opts.cafeBindAddr) {
      args.push('--cafe-bind-addr')
      args.push(`"${opts.cafeBindAddr}"`)
    }
    if (opts.profileBindAddr) {
      args.push('--profile-bind-addr')
      args.push(`"${opts.profileBindAddr}"`)
    }
    if (opts.gatewayBinAddr) {
      args.push('--gateway-bind-addr')
      args.push(`"${opts.gatewayBinAddr}"`)
    }
    if (opts.cafe) {
      args.push('--cafe')
    }
    if (opts.cafeUrl) {
      args.push('--cafe-url')
      args.push(`"${opts.cafeUrl}"`)
    }
    if (opts.cafeNeighborUrl) {
      args.push('--cafe-neighbor-url')
      args.push(`"${opts.cafeNeighborUrl}"`)
    }
    // Add 'extra' commandline args
    args = args.concat(flags || [])

    await run(this, args, { env: this.env })
    this.clean = false
    this.initialized = true
    return this
  }

  /**
   * Delete the repo that was being used. If the node was marked as disposable this will be called automatically when the process is exited.
   */
  async cleanup() {
    if (this.clean) {
      return
    }
    await fs.remove(this.repoPath)
    this.clean = true
  }

  /**
   * Start a node daemon session.
   *
   * @param opts Set of options to use when starting the daemon.
   * @param flags Additional array of command-line flags to be passed to the `textile daemon` command.
   */
  async start(opts: StartOptions = {}, flags?: string[]) {
    if (opts.repoPath && opts.repoPath !== this.repoPath) {
      this.repoPath = opts.repoPath
    }
    // @todo: This is probably not quite what we should do here...
    // maybe allow users to provide an api client directly?
    this.api = new Textile()
    try {
      await this.api.utils.online()
      // @todo: Should we return a warning or set a flag indicating this was already started?
      this.started = true
      return this
    } catch (err) {
      // We'll need to start it then!
    }

    let args = ['daemon']
    if (opts.debug) {
      args.push('--debug')
    }
    if (opts.pincode) {
      args.push('--pin')
      args.push(`"${opts.pincode}"`)
    }
    if (this.repoPath) {
      args.push('--repo')
      args.push(path.resolve(this.repoPath))
    }
    if (opts.serveDocs) {
      args.push('--serve-docs')
    }
    // Add 'extra' commandline args
    args = args.concat(flags || [])

    let output = ''
    return new Promise<Daemon>(async (resolve, reject) => {
      this.subprocess = run(this, args, {
        env: this.env,
        stderr: data => {
          data = String(data)
          if (data) {
            daemonLog.err(data.trim())
          }
        },
        stdout: data => {
          data = String(data)
          if (data) {
            daemonLog.info(data.trim())
          }
          output += data

          const apiMatch = output.trim().match(/API .*address:? (.*)/)
          // const gwMatch = output.trim().match(/Gateway .*address:? (.*)/)
          if (apiMatch && apiMatch.length > 0) {
            const url = new URL(`http://${apiMatch[1]}`)
            this.api = new Textile({
              url: 'http://' + url.hostname,
              port: parseInt(url.port),
            })
          }

          if (output.match(/(?:Account:? .*)/)) {
            // we're good
            this.started = true
            resolve(this)
          }
        },
      })

      try {
        await this.subprocess
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Stop the daemon.
   *
   * @param timeout Use timeout to specify the grace period in ms before hard stopping the daemon.
   * Otherwise, a grace period of 10500 ms will be used for disposable nodes and 10500 * 3 ms for non disposable nodes.
   */
  async stop(timeout?: number) {
    if (!this.subprocess) {
      return
    }
    await this.killProcess(timeout)
  }

  /**
   * Kill the `textile daemon` process.
   *
   * If the HTTP API is established, then send 'shutdown' command; otherwise,
   * process.kill(`SIGTERM`) is used. In either case, if the process
   * does not exit after 10.5 seconds then a `SIGKILL` is used.
   *
   * @param timeout Use timeout to specify the grace period in ms before hard stopping the daemon.
   * Otherwise, a grace period of 10500 ms will be used for disposable nodes and 10500 * 3 ms for non disposable nodes.
   */
  async killProcess(timeout?: number) {
    if (!timeout) {
      timeout = this.disposable ? GRACE_PERIOD : NON_DISPOSABLE_GRACE_PERIOD
    }
    return new Promise((resolve, reject) => {
      // Need a local var for the closure, as we clear the var.
      const subprocess = this.subprocess
      this.subprocess = undefined
      if (subprocess) {
        const grace = setTimeout(() => {
          log('kill timeout, using SIGKILL', subprocess.pid)
          subprocess.kill('SIGKILL')
        }, timeout)

        subprocess.once('exit', () => {
          log('killed', subprocess.pid)
          clearTimeout(grace)
          this.started = false
          if (this.disposable) {
            return this.cleanup().then(resolve, reject)
          }
          resolve()
        })

        log('killing', subprocess.pid)
        subprocess.kill('SIGTERM')
      } else {
        resolve()
      }
    })
  }

  /**
   * Get the pid of the `textile daemon` process.
   */
  pid() {
    return this.subprocess && this.subprocess.pid
  }

  /**
   * Get the version of ipfs
   */
  async version() {
    const result = await run(this, ['version'], { env: this.env })
    return result ? result.stdout.trim() : 'unknown'
  }
}

export default Daemon
