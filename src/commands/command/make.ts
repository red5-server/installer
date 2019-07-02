import * as path from 'path'
import * as fs from 'fs'
import { error, PATH, RESOURCES, isFile, replaceTemplateVars } from '../..'
import { Command } from '../Command'
import * as mkdirp from 'mkdirp'
import { OptionDefinition } from 'command-line-args';

interface CommandMakeOptions {
  name: string
  api: boolean
  resource: boolean
}

export default class extends Command {

  public name: string = 'command:make'
  public description: string = 'Makes a new Command line command'
  public options: OptionDefinition[] = [
    { name: 'name', defaultOption: true }
  ]

  public async fire(options: CommandMakeOptions) {

    // This is the root location of the commands
    const COMMANDS_ROOT = 'app/commands'

    // Get the name of the command
    let [command_group, command] = options.name.split(':')

    if (!command) {
      command = command_group
      command_group = ''
    }

    return new Promise<void>(async resolve => {
      let commandPath = path.join(PATH, COMMANDS_ROOT, command_group, command + '.js')
      if (await isFile(commandPath)) {
        console.log(error('This command already exists.'))
        return resolve()
      }

      mkdirp.sync(path.join(PATH, COMMANDS_ROOT, command_group))

      // Copy the template from the resources folder
      fs.createReadStream(path.join(RESOURCES, 'templates/command/command.tpl'))
        .pipe(fs.createWriteStream(commandPath))
        .on('close', () => {
          let contents = fs.readFileSync(commandPath).toString()
          fs.writeFileSync(commandPath, replaceTemplateVars(contents, [['name', `${command_group}:${command}`]]))
          resolve()
        })
    })
  }
}