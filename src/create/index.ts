import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import { error, info } from '..'
import clone = require('git-clone')

export interface CreateOptions {
  project: string
  type: 'typescript' | 'javascript'
}

export function makeNewProject(createOptions: CreateOptions) {
  let projectDir = path.join(process.cwd(), createOptions.project)
  fs.stat(projectDir, (err, stats) => {
    if (err) {
      // Could not find the directory, lets create the project
      return cloneRepository(projectDir, createOptions)
    }
    if (process.platform == 'win32') {
      // Windows does not allow for files and directories to be named the same
      if (stats.isDirectory() || stats.isFile()) {
        // The stats of the path is a directory, we can't overwrite it
        return console.log(error(`The project "${createOptions.project}" already exists, delete the directory and run the new command again or use a different project name.`))
      } else {
        return cloneRepository(projectDir, createOptions)
      }
    } else {
      if (stats.isDirectory()) {
        // The stats of the path is a directory, we can't overwrite it
        return console.log(error(`The project "${createOptions.project}" already exists, delete the directory and run the new command again or use a different project name.`))
      } else {
        // The stats of the path is a file, we can make a new project
        return cloneRepository(projectDir, createOptions)
      }
    }
  })
}

function cloneRepository(projectDir: string, createOptions: CreateOptions) {
  clone('https://github.com/red5-server/framework', projectDir, { shallow: true }, () => {
    if (createOptions.type == 'javascript') {
      cp.exec(`node ./node_modules/.bin/tsc "${projectDir}"`, (err, stdout, stderr) => {
        if (err) return console.log(error(stderr))
        return console.log(info('JavaScript project has been built!'))
      })
    }
    return console.log(info('TypeScript project has been built!'))
  })
}