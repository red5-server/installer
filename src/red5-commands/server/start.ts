import { Command, CmdArguments } from '../Command'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const isProd = ['prod', 'production'].includes(process.env.APP_ENV || 'prod')

export default class ListCommands extends Command {
  public name: string = 'server:start'
  public description: string = 'Creates a development server for testing'
  public options: CmdArguments[] = []

  public async fire() {
    let out: any = 'ignore'
    let err: any = 'ignore'
    if (!isProd) {
      let logs = path.join(process.cwd(), 'storage/framework/logs')
      mkdirp.sync(logs)
      out = fs.openSync(path.join(logs, 'server.log'), 'a')
      err = fs.openSync(path.join(logs, 'server.log'), 'a')
    }

    let child = cp.spawn('node', [path.join(__dirname, '../../server')], { detached: true, stdio: ['ignore', out, err, 'ignore'] })

    let red5json = await import(path.join(process.cwd(), 'red5.json'))
    if (!red5json.server) red5json.server = {}
    if (red5json.server.pid && red5json.server.pid > 0) {
      // Attempt to kill the process
      // If start gets called when a process is already running we need to kill it
      // otherwise there will be multiple servers running which can cause issues
      try { process.kill(red5json.server.pid) } catch (e) { }
    }
    red5json.server.pid = child.pid
    fs.writeFile(path.join(process.cwd(), 'red5.json'), JSON.stringify(red5json, null, 2), () => { })

    child.unref()
  }
}