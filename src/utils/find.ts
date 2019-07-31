import fs from 'fs-extra'
import os from 'os'
const isWindows = os.platform() === 'win32'
import path from 'path'

const find = (rootPath: string) => {
  const depPath = path.join('@textile', 'go-textile-dep', 'binary', isWindows ? 'textile.exe' : 'textile')

  let appRoot = rootPath ? path.join(rootPath, '..') : process.cwd()
  // If inside app.asar try to load from app.asar.unpacked
  // This only works if the app asar was built with something like:
  // electron-builder ./ -c.asarUnpack=**/node_modules/@textile/go-textile-dep
  if (appRoot.includes(`.asar${path.sep}`)) {
    appRoot = appRoot.replace(`.asar${path.sep}`, `.asar.unpacked${path.sep}`)
  }
  const npm3Path = path.join(appRoot, '..', '..', depPath)
  const npm2Path = path.join(appRoot, '..', 'node_modules', depPath)

  if (fs.existsSync(npm3Path)) {
    return npm3Path
  }

  if (fs.existsSync(npm2Path)) {
    return npm2Path
  }

  try {
    return require.resolve(depPath)
  } catch (error) {
    // ignore the error
  }

  throw new Error('Cannot find the Textile executable')
}

export default find
