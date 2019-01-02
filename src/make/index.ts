import { isRed5Project } from '../helper'
import { error } from '..'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'

export interface MakeControllerOptions {
  name: string
  api: boolean
  resource: boolean
}

export interface MakeMiddlewareOptions {
  name: string
}

const PATH = process.cwd()
const RESOURCES = path.join(__dirname, '../../resources')

/**
 * Creates a controller in the "app/controllers" directory
 */
export async function makeController(options: MakeControllerOptions) {
  if (!(await isRed5Project())) return console.log(error('This is not a red5 project'))

  if (options.api && options.resource) {
    return console.log(error('Either use "api" or "resource" but do not use both'))
  }

  // Get the path to the controller
  const CONTROLLER_PATH = options.name.split('/').slice(0, -1).join('/')

  // Get the name of the controller
  const CONTROLLER = options.name.split('/').pop()

  // Create the directory in the controllers folder
  mkdirp.sync(path.join(PATH, 'app/controllers', CONTROLLER_PATH))

  return new Promise<void>(async resolve => {
    let controllerPath = path.join(PATH, 'app/controllers', CONTROLLER_PATH, CONTROLLER + '.js')
    if (await isFile(controllerPath)) {
      console.log(error('This controller already exists.'))
      return resolve()
    }

    // Get the proper template to use
    let controllerToUse = 'controller'
    if (options.api) controllerToUse = 'controller.api'
    else if (options.resource) controllerToUse = 'controller.resource'

    // Copy the template from the resources folder
    fs.createReadStream(path.join(RESOURCES, 'templates/make/' + controllerToUse + '.tpl'))
      .pipe(fs.createWriteStream(controllerPath))
      .on('close', () => resolve())
  })
}

/**
 * Creates middleware in the "app/middleware" directory
 */
export async function makeMiddleware(options: MakeMiddlewareOptions) {
  if (!(await isRed5Project())) return console.log(error('This is not a red5 project'))

  // Get the path to the controller
  const MIDDLEWARE_PATH = options.name.split('/').slice(0, -1).join('/')

  // Get the name of the controller
  const MIDDLEWARE = options.name.split('/').pop() || ''

  // Create the directory in the middleware folder
  mkdirp.sync(path.join(PATH, 'app/middleware', MIDDLEWARE_PATH))
  return new Promise<void>(async resolve => {
    let middlewarePath = path.join(PATH, 'app/middleware', MIDDLEWARE_PATH, MIDDLEWARE + '.js')
    if (await isFile(middlewarePath)) {
      console.log(error('This middleware already exists.'))
      return resolve()
    }
    // Copy the template from the resources folder
    fs.createReadStream(path.join(RESOURCES, 'templates/make/middleware.tpl'))
      .pipe(fs.createWriteStream(middlewarePath))
      .on('close', () => {
        let data = fs.readFileSync(middlewarePath).toString()
        let replaced = replace(data, [['name', MIDDLEWARE]])
        fs.writeFileSync(middlewarePath, replaced)
        resolve()
      })
  })
}

async function isFile(path: string) {
  return new Promise<boolean>(resolve => {
    fs.stat(path, (err, stats) => resolve(err ? false : stats.isFile() || stats.isDirectory()))
  })
}

function replace(data: string, replacements: string[][]) {
  replacements.forEach(item => {
    let [find, replace] = item
    data = data.replace(new RegExp('\\$\\$\\{\\{' + find + '\\}\\}', 'g'), replace)
  })
  return data
}