import { isRed5Project } from '../helper'
import { error, PATH, RESOURCES, isFile } from '..'
import { MakeControllerOptions } from '.'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Creates a controller in the "app/controllers" directory
 *
 * @export
 * @param {MakeControllerOptions} options Settings for making the controller
 * @returns {Promise<void>}
 */
export async function makeController(options: MakeControllerOptions): Promise<void> {
  if (!(await isRed5Project())) return console.log(error('This is not a red5 project'))

  if (options.api && options.resource) {
    return console.log(error('Either use "api" or "resource" but do not use both'))
  }

  // This is the root location of the controllers
  const CONTROLLER_ROOT = 'app/controllers'

  // Get the path to the controller
  const CONTROLLER_PATH = options.name.split('/').slice(0, -1).join('/')

  // Get the name of the controller
  const CONTROLLER = options.name.split('/').pop()

  // Create the directory in the controllers folder
  mkdirp.sync(path.join(PATH, CONTROLLER_ROOT, CONTROLLER_PATH))

  return new Promise<void>(async resolve => {
    let controllerPath = path.join(PATH, CONTROLLER_ROOT, CONTROLLER_PATH, CONTROLLER + '.js')
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