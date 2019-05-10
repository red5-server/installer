import * as path from 'path'
import * as fs from 'fs'

export interface MakeControllerOptions {
  name: string
  api: boolean
  resource: boolean
}

export interface MakeMiddlewareOptions {
  name: string
}

/** @type {string} The Location of the current directory the script is executing within (This is where a red5 project should be living) */
export const PATH: string = process.cwd()

/** @type {string} The root location of where the resources such as template files live */
export const RESOURCES: string = path.join(__dirname, '../../resources')

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