import * as fs from 'fs'
import * as path from 'path'

export async function isRed5Project() {
  const DIR = process.cwd()
  const RED5_PATH = path.join(DIR, 'red5.json')
  return new Promise<boolean>(resolve => {
    fs.stat(RED5_PATH, async (err, stats) => {
      return resolve(err ? false : stats.isFile())
    })
  })
}