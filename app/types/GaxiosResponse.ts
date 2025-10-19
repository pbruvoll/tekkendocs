// since the google library does not export the resonse-type, we create our own simplified version
export interface GaxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}
