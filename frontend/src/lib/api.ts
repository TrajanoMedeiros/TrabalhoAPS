type ApiErrorPayload = {
  error?: {
    message?: string
    details?: Record<string, string[]>
  }
  message?: string
}

export class ApiError extends Error {
  public readonly status: number
  public readonly details?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const payload = (await response.json().catch(() => ({}))) as
    | { data?: T }
    | ApiErrorPayload

  if (!response.ok) {
    const error = payload as ApiErrorPayload
    throw new ApiError(
      error.error?.message ?? error.message ?? 'Nao foi possivel completar a operacao.',
      response.status,
      error.error?.details,
    )
  }

  return ((payload as { data?: T }).data ?? {}) as T
}
