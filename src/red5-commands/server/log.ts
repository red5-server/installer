import { Command, CmdArguments } from '../Command'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'

export default class ListCommands extends Command {
  public name: string = 'server:log'
  public description: string = 'Watches the server log in real time'
  public options: CmdArguments[] = []

  public async fire() {
    let watch = cp.spawn('tail', ['-f', path.join(process.cwd(), 'storage/framework/logs/server.log')], { windowsHide: true })

    watch.stdout && watch.stdout.on('data', chunk => process.stdout.write(chunk))
    watch.stdout && watch.stderr.on('data', chunk => process.stdout.write(chunk))
  }
}