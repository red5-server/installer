import * as path from 'path'
import * as fs from 'fs'
import { isRed5Project } from '../helper'
import { error, PATH, RESOURCES, isFile, replaceTemplateVars } from '..'
import { CommandMakeOptions } from '.'
import * as mkdirp from 'mkdirp'

export async function commandMake(options: CommandMakeOptions) {
  if (!(await isRed5Project())) return console.log(error('This is not a red5 project'))

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