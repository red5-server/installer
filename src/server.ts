import * as cp from 'child_process'
import * as path from 'path'
// import * as fs from 'fs'
import chalk from 'chalk'
import * as chokidar from 'chokidar'

// The main server process
let server: null | cp.ChildProcess

// Watch to make sure the child process is running
let interval: NodeJS.Timeout | null = setInterval(watch, 1000)

process.on('exit', () => process.stdout.write(`Process "${process.pid}" has exited`))

let cwd = process.argv[2] ? process.argv[2] : process.cwd()

// Watch major directories for file changes and restart the server if a file changes
chokidar.watch([
  path.join(cwd, 'app'),
  path.join(cwd, 'config'),
  path.join(cwd, 'routes')
]).on('all', change)

let maxRestarts = 5
let restarts = 0

// Creates a new server instance at startup or upon file change
// Basically anytime the server goes down
async function createServer() {
  if (server) return
  try {
    console.log(chalk.blueBright(`Starting the development server at [${new Date().toLocaleString()}]`))

    server = cp.spawn('node', [path.join(cwd, 'index.js')], { windowsHide: true })
    server.stdout && server.stdout.on('data', chunk => process.stdout.write(chunk))
    server.stderr && server.stderr.on('data', chunk => process.stderr.write(chunk))

    server.on('close', () => {
      server = null
      console.log(chalk.greenBright(`Sever has successfully shut down at [${new Date().toLocaleString()}]`))
    })
    restarts = 0
  } catch (e) {
    if (restarts++ == maxRestarts) {
      process.kill(process.pid)
    }
  }
}

// Watch the server to make sure it is running
async function watch() {
  if (!server) await createServer()
}

function change() {
  if (server) {
    console.log(chalk.blueBright(`File changed at [${new Date().toLocaleString()}] restarting the development server`))
    server.kill()
  }
}