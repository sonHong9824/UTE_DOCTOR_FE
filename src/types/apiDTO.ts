export interface DataResponse<T> {
  code: string;
  message: string;
  data: T;
}