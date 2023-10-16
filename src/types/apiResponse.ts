import { ErrorApiResponse } from './ErrorApiResponse'
import { SuccessApiResponse } from './SuccessApiResponse'

export type ApiResponse<T = null> = SuccessApiResponse<T> | ErrorApiResponse
