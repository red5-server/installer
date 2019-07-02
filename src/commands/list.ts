import { Command } from './Command';
import { OptionDefinition } from 'command-line-args';
import * as glob from 'glob'
import * as path from 'path'

interface ItemInfo {
  name: string
  description: string
  options: OptionDefinition[]
}

export default class extends Command {
  public name: string = 'list'
  public description: string = 'Lists all of the supported commands'
  public options: OptionDefinition[] = []

  public async fire() {
    // Get all the commands
    let custom = path.join(process.cwd(), 'app/commands', '*/*.js')
    let builtin = path.join(__dirname, '../commands', '*/*.js')
    let builtinRoot = path.join(__dirname, '../commands', '*.js')

    // Glob the command locations
    let customFiles = await new Promise<string[]>(resolve => glob(custom, (err, matches) => resolve(matches)))
    let builtinFiles = await new Promise<string[]>(resolve => glob(builtin, (err, matches) => resolve(matches)))
    let rootFiles = await new Promise<string[]>(resolve => glob(builtinRoot, (err, matches) => resolve(matches)))

    // Create a list of the files
    let files = customFiles.concat(...builtinFiles).concat(...rootFiles)
    let longest = 0

    // Get the information from each command
    let fileInfo = files.map(file => {
      let cmd = require(file)
      let command: Command | null = null
      if (cmd && cmd.default) {
        command = new cmd.default()
      } else if (cmd) {
        try {
          command = new cmd()
        } catch (e) { }
      }

      // Build the results
      if (command) {
        longest = command.name.length > longest ? command.name.length : longest
        return {
          name: command.name,
          description: command.description,
          options: command.options
        } as ItemInfo
      }
      return {} as ItemInfo
    }).filter(i => i.name && i.name.length).sort((a, b) => a.name.localeCompare(b.name))

    // Display the command information in the terminal
    fileInfo.forEach(info => console.log(`${info.name.padEnd(longest + 2, ' ')} ${info.description}`))
  }
}