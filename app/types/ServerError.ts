import { type ServerStatusCode } from './ServerStatusCode';

export type ServerError = {
  title: string;
  detail?: string;
  status: ServerStatusCode;
  statusText?: string;
  exception?: unknown;
  upstreamErrorResponse?: {
    body?: string;
    status: number;
    statusText: string;
  };
};

/** What actually reaches the error boundary. Every value is a plain,
    serialisable one, so that the server render and the hydration agree. */
export type ServerErrorData = {
  title: string;
  detail?: string;
  exception?: string;
  upstreamErrorResponse?: {
    body?: string;
    status?: number;
    statusText?: string;
  };
};
