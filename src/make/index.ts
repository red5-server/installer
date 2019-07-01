export * from './controller'
export * from './middleware'

export interface MakeControllerOptions {
  name: string
  api: boolean
  resource: boolean
}

export interface MakeMiddlewareOptions {
  name: string
}
