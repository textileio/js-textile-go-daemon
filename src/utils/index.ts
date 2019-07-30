import os from 'os'
import path from 'path'
import hat from 'hat'
export { default as find } from './find'
export { default as run } from './run'

export const tempDir = () => path.join(os.tmpdir(), `textile_${hat()}`)
