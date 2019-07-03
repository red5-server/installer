import { Command, CmdArguments } from '../Command'
import * as path from 'path'
import * as cp from 'child_process'
import * as fs from 'fs'
import chalk from 'chalk'

export default class ListCommands extends Command {
  public name: string = 'server:start'
  public description: string = 'Creates a test server to run your website'
  public options: CmdArguments[] = []

  private _server: cp.ChildProcess | null = null

  public async fire() {
    // setInterval(this._watch.bind(this), 1000)
    this._createServer()
  }

  private _watch() {
    if (!this._server) this._createServer()
  }

  private _createServer() {
    console.log(chalk.blueBright(`Starting the development server at [${new Date().toLocaleString()}]`))
    cp.fork(path.join(process.cwd(), 'index.js'), [], { detached: true, silent: true })
    // this._server = cp.fork(path.join(process.cwd(), 'index.js'), [], { detached: true })
    // this._server.stdout && this._server.stdout.on('data', chunk => console.log(chunk))
    // this._server.stderr && this._server.stderr.on('data', chunk => console.error(chunk))
    // fs.watch(path.join(process.cwd(), 'app'), { recursive: true }).on('change', this._change.bind(this))
    // fs.watch(path.join(process.cwd(), 'config'), { recursive: true }).on('change', this._change.bind(this))
    // fs.watch(path.join(process.cwd(), 'routes'), { recursive: true }).on('change', this._change.bind(this))
  }

  private _change() {
    if (this._server) {
      console.log(chalk.blueBright(`File changed at [${new Date().toLocaleString()}] restarting the development server`))
      fs.unwatchFile(path.join(process.cwd(), 'app'))
      fs.unwatchFile(path.join(process.cwd(), 'config'))
      fs.unwatchFile(path.join(process.cwd(), 'routes'))
      this._server.kill()
      this._server = null
      console.log(chalk.greenBright(`Sever has successfully shut down at [${new Date().toLocaleString()}]`))
    }
  }
}