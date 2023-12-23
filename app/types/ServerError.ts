import { type ServerStatusCode } from './ServerStatusCode'

export type ServerError = {
  title: string
  detail?: string
  status: ServerStatusCode
  statusText?: string
  exception?: unknown
  upstreamErrorResponse?: {
    body?: string
    status: number
    statusText: string
  }
}
