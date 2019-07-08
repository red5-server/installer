import * as fs from 'fs'
import * as path from 'path'
import { error } from '.'

export async function isRed5Project(dir?: string) {
  const DIR = dir ? path.resolve(process.cwd(), dir) : process.cwd()
  const RED5_PATH = path.join(DIR, 'red5.json')
  return new Promise<boolean>(resolve => {
    try {
      fs.stat(RED5_PATH, async (err, stats) => {
        return resolve(err ? false : stats.isFile())
      })
    } catch (e) { return resolve(false) }
  })
}

export function notAProject() {
  console.log(error('This is not a red5 project'))
  console.log('  -- Run "red5 new <project-name>" to create a new project')
}