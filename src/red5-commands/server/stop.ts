import { Command, CmdArguments } from '../Command'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { isRed5Project, notAProject } from '../../helper'
import { error } from '../..'

interface ServerStopOptions {
  path?: string
}

export default class ListCommands extends Command {
  public name: string = 'server:stop'
  public description: string = 'Stops the development server'
  public options: CmdArguments[] = [
    { name: 'path', defaultOption: true, description: 'An optional path to a server to be stopped' }
  ]

  public async fire(options: ServerStopOptions) {
    try {
      let dir = options.path ? path.resolve(process.cwd(), options.path) : process.cwd()
      if (!await isRed5Project(dir)) return notAProject()
      let red5json = await import(path.join(dir, 'red5.json'))
      if (red5json.server && red5json.server.pid) {
        let pid = red5json.server.pid
        console.log(`Stopping server with a process id of "${pid}"`)
        os.platform() == 'win32' ? process.kill(pid) : process.kill(-pid)
        delete red5json.server.pid
      }
      fs.truncate(path.join(dir, 'storage/framework/logs/server.log'), () => { })
      fs.writeFile(path.join(dir, 'red5.json'), JSON.stringify(red5json, null, 2), () => { })
    } catch (e) {
      console.log(error(e.message))
    }
  }

}