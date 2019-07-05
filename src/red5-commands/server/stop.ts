import { Command, CmdArguments } from '../Command'
import * as path from 'path'
import * as fs from 'fs'

export default class ListCommands extends Command {
  public name: string = 'server:stop'
  public description: string = 'Stops the development server'
  public options: CmdArguments[] = []

  public async fire() {
    try {
      let red5json = await import(path.join(process.cwd(), 'red5.json'))
      if (red5json.server && red5json.server.pid) {
        let pid = red5json.server.pid
        process.kill(pid)
        delete red5json.server.pid
      }
      fs.truncate(path.join(process.cwd(), 'storage/framework/logs/server.log'), () => { })
      fs.writeFile(path.join(process.cwd(), 'red5.json'), JSON.stringify(red5json, null, 2), () => { })
    } catch (e) {

    }
  }

}