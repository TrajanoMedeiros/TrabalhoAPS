import { ApiError } from './api'

export function getErrorMessage(
  error: unknown,
  fallback = 'Nao foi possivel concluir a acao.',
): string {
  if (error instanceof ApiError) {
    const firstFieldError = Object.values(error.details ?? {})[0]?.[0]
    if (typeof firstFieldError === 'string' && firstFieldError.startsWith('validation.')) {
      if (firstFieldError === 'validation.unique') {
        return 'Este e-mail já está em uso.'
      }

      return 'Revise os campos informados.'
    }
    return firstFieldError ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
