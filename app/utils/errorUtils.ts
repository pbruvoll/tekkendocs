import { json } from '@remix-run/node'
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
      exception: serverError.exception,
    },
    {
      status: serverError.status,
      statusText: serverError.statusText || statusToText[serverError.status],
    },
  )
}
