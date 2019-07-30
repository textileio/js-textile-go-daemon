import os from 'os'
import path from 'path'
import execa from 'execa'
import debug from 'debug'
import Daemon from '../daemon'
const isWindows = os.platform() === 'win32'
const log = debug('@textile/go-daemon:exec')
const noop = () => {}

export interface ExecOptions {
  env?: NodeJS.ProcessEnv
  stderr?: (chunk: any) => void
  stdout?: (chunk: any) => void
  execArgv?: string[]
}

const exec = (cmd: string, args?: string[], opts: ExecOptions = {}) => {
  log(path.basename(cmd), (args ? args : []).join(' '))
  const command = execa(cmd, args, { env: opts.env })
  if (command.stderr) {
    command.stderr.on('data', opts.stderr || noop)
  }
  if (command.stdout) {
    command.stdout.on('data', opts.stdout || noop)
  }
  return command
}

const run = (node: Daemon, args: string[], opts: ExecOptions = {}) => {
  let executable = node.exec

  if (isWindows && executable.endsWith('.js')) {
    args = args || []
    args.unshift(node.exec)
    executable = process.execPath
  }

  // @todo: Do we even need this anymore?
  // Don't pass on arguments that were passed into the node executable
  opts.execArgv = []

  return exec(executable, args, opts)
}

export default run
