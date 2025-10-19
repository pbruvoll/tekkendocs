export type ResultError = {
  title: string;
  exception?: unknown;
  responseError?: {
    body: string;
    status: number;
    statusText: string;
  };
};
