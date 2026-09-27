import { data } from 'react-router';
import { environment } from '~/constants/environment.server';
import { type ServerError, type ServerErrorData } from '~/types/ServerError';
import { type ServerStatusCode } from '~/types/ServerStatusCode';

const statusToText: Record<ServerStatusCode, string> = {
  '400': 'Bad request',
  '404': 'Not found',
  '500': 'Server error',
  '502': 'Bad gateway',
};

// An Error does not survive the trip to the client intact: the router sends it
// on as its message and stack, dropping the own properties that a library
// error such as the one from gaxios carries. Anything derived from those
// properties would therefore differ between the server render and the
// hydration, so the exception is flattened to a string here, on the server,
// where it is still complete.
const describeException = (exception: unknown): string => {
  if (exception instanceof Error) {
    return `${exception.name}: ${exception.message}`;
  }
  try {
    return JSON.stringify(exception) ?? String(exception);
  } catch {
    return String(exception);
  }
};

export const createErrorResponse = (serverError: ServerError) => {
  // we dont want to leak info as exception or body of upstream error if we are in production mode
  const isDevelopment = environment.nodeEnv === 'development';
  const { exception, upstreamErrorResponse } = serverError;

  const errorData: ServerErrorData = {
    title: serverError.title,
    detail: serverError.detail,
    ...(exception !== undefined && {
      exception: isDevelopment ? describeException(exception) : 'N/A',
    }),
    ...(upstreamErrorResponse && {
      upstreamErrorResponse: {
        status: upstreamErrorResponse.status,
        statusText: upstreamErrorResponse.statusText,
        body: isDevelopment ? upstreamErrorResponse.body : 'N/A',
      },
    }),
  };

  return data(errorData, {
    status: serverError.status,
    statusText: serverError.statusText || statusToText[serverError.status],
  });
};
