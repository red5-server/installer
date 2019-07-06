import { Command, CmdArguments } from '../Command'
import * as cp from 'child_process'

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
  public name: string = 'package:list'
  public description: string = 'A list of all available red5 packages'
  public options: CmdArguments[] = [{ name: 'name', defaultOption: true }]

  public async fire() {
    cp.exec(`npm search @red5 --json`, (err, stdout, stderr) => {
      if (!err) {
        let longest = 0
        let packages = (JSON.parse(stdout) as NPMPackage[])
          .filter(p => !['@red5/core', '@red5/cli', '@red5/middleware'].includes(p.name))
        packages.forEach(p => longest = p.name.length > longest ? p.name.length : longest)
        packages.forEach(pkg => {
          console.log(`\x1b[32m${pkg.name.padEnd(longest + 2, ' ')}\x1b[0m ${pkg.description}`)
        })
      }
    })
  }
}