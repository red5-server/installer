declare module 'git-clone' {
  function clone(repo: string, targetPath: string, cb: () => void): void
  function clone(repo: string, targetPath: string, options: { git?: string, shallow?: boolean, checkout?: string }, cb: () => void): void
  export = clone
}