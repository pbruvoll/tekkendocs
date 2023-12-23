import { json } from '@remix-run/node'
import { environment } from '~/constants/environment.server'
import { type ServerError } from '~/types/ServerError'
import { type ServerStatusCode } from '~/types/ServerStatusCode'

const statusToText: Record<ServerStatusCode, string> = {
  '400': 'Bad request',
  '404': 'Not found',
  '500': 'Server error',
  '502': 'Bad gateway',
}

export const createErrorResponse = (serverError: ServerError): Response => {
  return json(
    {
      title: serverError.title,
      detail: serverError.detail,
      // we dont want to leak info as exception of boyd of upstream error if we are in production mode
      exception:
        environment.nodeEnv === 'development' ? serverError.exception : 'N/A',
      upstreamError: {
        ...serverError.upstreamErrorResponse,
        body:
          environment.nodeEnv === 'development'
            ? serverError.upstreamErrorResponse?.body
            : 'N/A',
      },
    },
    {
      status: serverError.status,
      statusText: serverError.statusText || statusToText[serverError.status],
    },
  )
}
