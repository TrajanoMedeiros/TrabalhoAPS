import type { FormEvent } from 'react'
import { api } from '../../services/api'
import { getErrorMessage } from '../../services/error'
import { tokenKey } from '../../stores/forms'
import type { AuthForm, AuthMode, AuthPayload, SavingAction, User, View } from '../../types'
import type { Setter } from '../shared'

type AuthFlowDependencies = {
  authMode: AuthMode
  authForm: AuthForm
  setActiveView: Setter<View>
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
  setToken: Setter<string | null>
  setUser: Setter<User | null>
  syncProfileForm: (user: User) => void
}

export function useAuthFlow({
  authMode,
  authForm,
  setActiveView,
  setError,
  setNotice,
  setSaving,
  setToken,
  setUser,
  syncProfileForm,
}: AuthFlowDependencies) {
  function saveSession(payload: AuthPayload) {
    window.localStorage.setItem(tokenKey, payload.token)
    setToken(payload.token)
    setUser(payload.user)
    syncProfileForm(payload.user)
    setActiveView('dashboard')
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('auth')
    setError(null)
    setNotice(null)

    try {
      const payload =
        authMode === 'register'
          ? {
              nome: authForm.nome.trim(),
              email: authForm.email.trim().toLowerCase(),
              senha: authForm.senha,
              tipo_usuario: authForm.tipo_usuario,
            }
          : {
              email: authForm.email.trim().toLowerCase(),
              senha: authForm.senha,
            }

      const authPayload = await api<AuthPayload>(
        authMode === 'register' ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )

      saveSession(authPayload)
      setNotice(authMode === 'register' ? 'Conta criada com sucesso.' : 'Login realizado.')
    } catch (authError) {
      setError(getErrorMessage(authError, 'Nao foi possivel autenticar.'))
    } finally {
      setSaving(null)
    }
  }

  return { handleAuth }
}
