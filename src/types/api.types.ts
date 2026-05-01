export type ApiSuccess<T> = {
  data: T
}

export type ApiError = {
  error: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiError
