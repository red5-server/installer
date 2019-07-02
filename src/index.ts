#!/usr/bin/env node
import * as cmdArgs from 'command-line-args'
import { OptionDefinition } from 'command-line-args'
process.argv.push('--color')
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs'
import { Command } from './commands/Command'
import { isRed5Project } from './helper';

export const error = chalk.bold.red
export const warning = chalk.bold.yellow
export const info = chalk.bold.cyan

/** @type {string} The Location of the current directory the script is executing within (This is where a red5 project should be living) */
export const PATH: string = process.cwd()

/** @type {string} The root location of where the resources such as template files live */
export const RESOURCES: string = path.join(__dirname, '../resources')

const mainDefinitions: OptionDefinition[] = [
  { name: 'command', defaultOption: true },
  { name: 'version', alias: 'v', defaultValue: '1' }
]


/**
 * Tests if a path is the location of an existing file or directory
 *
 * @export
 * @param {string} path The path to the file
 * @returns {Promise<boolean>}
 */
export async function isFile(path: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.stat(path, (err, stats) => resolve(err ? false : stats.isFile() || stats.isDirectory()))
  })
}

/**
 * Replaces the template variables with data
 *
 * @export
 * @param {string} data The template string
 * @param {[string, string][]} replacements The replacement data where `index 0` is the key and `index 1` is the value
 * @returns {string} The new template with the variables replaced
 */
export function replaceTemplateVars(data: string, replacements: [string, string][]): string {
  replacements.forEach(item => {
    let [find, replace] = item
    data = data.replace(new RegExp('\\$\\$\\{\\{' + find + '\\}\\}', 'g'), replace)
  })
  return data
}


interface Option {
  name: Options
  description: string
}

enum Options {
  New = 'new', Serve = 'serve',
  Add = 'add', Remove = 'remove',
  MakeController = 'make:controller',
  MakeMiddleware = 'make:middleware',
  CommandMake = 'command:make',
  Help = 'help'
}

let options: Option[] = [
  { name: Options.New, description: 'Creates a new project' },
  { name: Options.MakeController, description: `Makes a new controller` },
  { name: Options.MakeMiddleware, description: `Makes a new middleware` },
  { name: Options.CommandMake, description: `Makes a new command` },
  { name: Options.Serve, description: 'Serves the current project' },
]

async function runCommand() {
  const mainOptions = cmdArgs(mainDefinitions, { stopAtFirstUnknown: true } as any)
  let argv = mainOptions._unknown || []
  if (mainOptions.version === null) {
    try {
      let json = require(path.join(process.cwd(), 'node_modules/red5/package.json'))
      console.log(json.version)
    } catch (e) {
      console.log(error('This is not a working red5 application'))
    }
  } else {
    try {
      switch (mainOptions.command) {
        case Options.Serve:
          // serve()
          console.log(warning('Not yet implemented'))
          break
        case Options.Help:
          let longest = options.reduce<number>((s, v) => v.name.length > s ? v.name.length : s, 0)
          for (let opt of options) {
            console.log(''.padStart(2) + `${opt.name}`.padEnd(longest + 4) + `${opt.description}`)
          }
          break
        default:
          try {
            let [command_group, command_name] = mainOptions.command.split(':')

            if (!command_name) {
              command_name = command_group
              command_group = ''
            }

            // console.log(command_group, command_name)

            let cmd
            try {
              cmd = require(path.join(__dirname, 'commands', command_group, command_name + '.js'))
            } catch (e) {
              cmd = require(path.join(process.cwd(), 'app/commands', command_group, command_name + '.js'))
            }

            if (command_name != 'new') {
              if (!(await isRed5Project())) return console.log(error('This is not a red5 project'))
            }

            try {
              let command: Command
              if (cmd && cmd.default) {
                command = new cmd.default()
              } else {
                command = new cmd()
              }

              if (!command.name) throw new Error('Command does not have a name')
              else if (!command.description) throw new Error('Command does not have a description')
              else if (command.name != mainOptions.command) throw new Error(`Command name mismatch: "${mainOptions.command}" -> "${command.name}"`)
              else await command.fire(command.makeArgs(mainDefinitions))
            } catch (e) {
              console.log(error(e))
            }
          } catch (e) {
            console.log(error('Command was not found'))
            console.log('  red5 <command> [options]')
            console.log('  -- Run "red5 help" for help')
          }
          break
      }
    } catch (e) {
      console.log(error(e.message))
    }
  }
}

runCommand()