import { Command, CmdArguments } from '../Command';
import { OptionDefinition } from 'command-line-args';
import * as cp from 'child_process'
import * as os from 'os'

interface RemovePackageOptions {
  name: string
}

interface NPMPackage {
  name: string
  scope: string
  version: string
  description: string
  date: string
  links: {
    npm: string
  }
  publisher: {
    username: string
    email: string
  },
  maintainers: any[]
}

export default class extends Command {
  public name: string = 'package:remove'
  public description: string = 'Removes a supported red5 package'
  public options: CmdArguments[] = [{ name: 'name', defaultOption: true }]

  public async fire(options: RemovePackageOptions) {
    if (!options.name) throw new Error('A package name must be set')
    let packageName = options.name

    if (!packageName.startsWith('@red5')) packageName = `@red5/${packageName}`

    cp.exec(`npm search @red5 --json`, (err, stdout, stderr) => {
      if (!err) {
        let packages = JSON.parse(stdout) as NPMPackage[]
        let red5Package = packages.find(p => p.name == packageName)
        if (red5Package) {
          let cmd = os.platform().toLowerCase() == 'win32' ? 'npm.cmd' : 'npm'
          let i = cp.spawn(cmd, ['rm', '-s', red5Package.name])
          i.stdout.on('data', data => console.log(data.toString()))
          i.on('error', (e) => { console.error(e) })
        }
      }
    })
  }
}