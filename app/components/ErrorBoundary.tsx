import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { type ServerError } from '~/types/ServerError'

export const AppErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div className="prose prose-invert p-4">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <ErrorData data={error.data} />
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div className="prose prose-invert p-4">
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return (
      <div className="prose prose-invert p-4">
        <h1>Unknown Error</h1>
      </div>
    )
  }
}

type ErrorDataProps = { data: any }
const ErrorData = ({ data }: ErrorDataProps) => {
  if (typeof data === 'object' && 'title' in data) {
    const serverError = data as ServerError
    return (
      <div>
        <h2>{serverError.title}</h2>
        {serverError.detail && <p>{serverError.detail}</p>}
        {!!serverError.exception && (
          <p>exception : {JSON.stringify(serverError.exception)}</p>
        )}
        {!!serverError.upstreamErrorResponse && (
          <p>exception : {JSON.stringify(serverError.upstreamErrorResponse)}</p>
        )}
      </div>
    )
  } else if (typeof data === 'string') {
    return data
  }
  return <p>JSON.stringify(data)</p>
}
