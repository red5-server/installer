import { error, PATH, RESOURCES, isFile, replaceTemplateVars } from '../..'
import { Command, CmdArguments } from '../Command'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'

interface MakeControllerOptions {
  name: string
  api: boolean
  resource: boolean
}

export default class extends Command {
  public name: string = 'make:model'
  public description: string = 'Creates a new mysql database model'
  public options: CmdArguments[] = [
    { name: 'name', type: String, defaultOption: true }
  ]

  public async fire(options: MakeControllerOptions) {
    if (options.api && options.resource) {
      return console.log(error('Either use "api" or "resource" but do not use both'))
    }

    // This is the root location of the controllers
    const MODEL_ROOT = 'app/models'

    // Get the path to the controller
    const MODEL_PATH = options.name.split('/').slice(0, -1).join('/')

    // Get the name of the controller
    const MODEL = options.name.split('/').pop() || 'MIDDLEWARE'

    // Create the directory in the controllers folder
    mkdirp.sync(path.join(PATH, MODEL_ROOT, MODEL_PATH))

    return new Promise<void>(async resolve => {
      let modelPath = path.join(PATH, MODEL_ROOT, MODEL_PATH, MODEL + '.js')
      if (await isFile(modelPath)) {
        console.log(error('This controller already exists.'))
        return resolve()
      }

      // Get the proper template to use

      // Copy the template from the resources folder
      fs.createReadStream(path.join(RESOURCES, 'templates/make/model.tpl'))
        .pipe(fs.createWriteStream(modelPath))
        .on('close', () => {
          let contents = fs.readFileSync(modelPath).toString()
          fs.writeFileSync(modelPath, replaceTemplateVars(contents, [['name', MODEL]]))
          resolve()
        })
    })
  }
}