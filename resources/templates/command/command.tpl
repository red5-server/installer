const { Command } = require('@red5/server')

module.exports = class extends Command {

  constructor() {
    super()
    this.name = '$${{name}}'
    this.description = 'Command Description'
  }

  fire() {
    // TODO: Implement the command
  }
}