import type { ApiResponse } from '../types.js'

export function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  }
}
