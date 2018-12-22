import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
import { error, info } from '..'
import clone = require('git-clone')

export interface CreateOptions {
  project: string
  type: 'typescript' | 'javascript'
}

const sourceLocation = 'https://github.com/red5-server/red5'

export async function makeNewProject(createOptions: CreateOptions) {
  let projectDir = path.join(process.cwd(), createOptions.project)
  console.log(info(`Attempting to create project "${createOptions.project}"`))
  let built = await build(projectDir, createOptions)
  if (built) {
    console.log(info(`Attempting to install "node_modules"`))
    let installed = await installModules(projectDir)
    if (installed) {
      console.log(info(`Starting the test server`))
      await startTestServer(projectDir)
      return true
    }
  }
  return false
}

async function build(projectDir: string, createOptions: CreateOptions) {
  return new Promise<boolean>(resolve => {
    fs.stat(projectDir, async (err, stats) => {
      if (err) {
        // Could not find the directory, lets create the project
        return resolve(await cloneRepository(projectDir, createOptions))
      }
      if (process.platform == 'win32') {
        // Windows does not allow for files and directories to be named the same
        if (stats.isDirectory() || stats.isFile()) {
          // The stats of the path is a directory, we can't overwrite it
          return console.log(error(`The project "${createOptions.project}" already exists, delete the directory and run the new command again or use a different project name.`))
        } else {
          return resolve(await cloneRepository(projectDir, createOptions))
        }
      } else {
        if (stats.isDirectory()) {
          // The stats of the path is a directory, we can't overwrite it
          return console.log(error(`The project "${createOptions.project}" already exists, delete the directory and run the new command again or use a different project name.`))
        } else {
          // The stats of the path is a file, we can make a new project
          return resolve(await cloneRepository(projectDir, createOptions))
        }
      }
    })
  })
}

async function cloneRepository(projectDir: string, createOptions: CreateOptions) {
  return new Promise<boolean>(resolve => {
    clone(sourceLocation, projectDir, { shallow: true }, async () => {
      if (createOptions.type == 'javascript') {
        return resolve(await compileTypeScript(projectDir))
      }
      console.log(info('TypeScript successfully built'))
      return resolve(true)
    })
  })
}

async function compileTypeScript(projectDir: string) {
  return new Promise<boolean>(resolve => {
    cp.exec(`node ./node_modules/.bin/tsc "${projectDir}"`, (err, stdout, stderr) => {
      if (err) {
        console.log(error(stderr))
        return resolve(false)
      }
      console.log(info('JavaScript successfully built'))
      return resolve(true)
    })
  })
}

async function installModules(projectDir: string) {
  return new Promise<boolean>(resolve => {
    cp.exec(`cd "${projectDir}" && npm install`, (err, stdout, stderr) => {
      if (err) {
        console.log(error(stderr))
        return resolve(false)
      }
      console.log(info('node_modules successfully installed'))
      return resolve(true)
    })
  })
}

async function startTestServer(projectDir: string) {
  return new Promise<boolean>(resolve => {
    cp.fork(`${path.join(projectDir, 'index.js')}`)

    var url = 'http://localhost:5000'
    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open')
    cp.exec(start + ' ' + url)

    // cp.exec(`cd "${projectDir}" && node index.js`, (err, stdout, stderr) => {
    //   if (err) {
    //     console.log(error(stderr))
    //     return resolve(false)
    //   }
    //   console.log(info('node_modules successfully installed'))
    //   return resolve(true)
    // })
  })
}