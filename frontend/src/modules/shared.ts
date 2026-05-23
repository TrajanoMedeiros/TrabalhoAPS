import type { Dispatch, SetStateAction } from 'react'

export type ApiRequest = <T>(path: string, options?: RequestInit) => Promise<T>

export type Setter<T> = Dispatch<SetStateAction<T>>
