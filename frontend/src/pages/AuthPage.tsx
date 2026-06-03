import type { FormEvent } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button, Field } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { AuthForm, AuthMode } from '../types'

export function AuthPage({
  authMode,
  authForm,
  error,
  isSaving,
  onAuthModeChange,
  onAuthFormChange,
  onSubmit,
}: {
  authMode: AuthMode
  authForm: AuthForm
  error: string | null
  isSaving: boolean
  onAuthModeChange: (mode: AuthMode) => void
  onAuthFormChange: (value: AuthForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const isRegister = authMode === 'register'

  function switchMode(mode: AuthMode) {
    onAuthModeChange(mode)
    onAuthFormChange({ ...authForm, senha: '' })
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f7f9fc] px-4 py-14 text-slate-950 sm:py-20">
      <section className="grid w-full max-w-[484px] gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-slate-950">Saldoo</h1>
          <p className="mt-4 text-xl font-medium text-slate-500">Organize suas finanças</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-6 rounded-[28px] border border-slate-200 bg-white px-10 py-11 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
        >
          {error && (
            <Alert tone="error" icon={ShieldCheck}>
              {error}
            </Alert>
          )}

          {isRegister && (
            <Field label="Nome">
              <input
                required
                minLength={2}
                value={authForm.nome}
                onChange={(event) => onAuthFormChange({ ...authForm, nome: event.target.value })}
                className={`${inputClass} min-h-[60px] text-lg`}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </Field>
          )}

          <Field label="Email">
            <input
              required
              type="email"
              value={authForm.email}
              onChange={(event) => onAuthFormChange({ ...authForm, email: event.target.value })}
              className={`${inputClass} min-h-[60px] text-lg`}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Senha">
            <input
              required
              type="password"
              minLength={isRegister ? 8 : undefined}
              value={authForm.senha}
              onChange={(event) => onAuthFormChange({ ...authForm, senha: event.target.value })}
              className={`${inputClass} min-h-[60px] text-lg`}
              placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </Field>

          <Button type="submit" disabled={isSaving} className="mt-3 min-h-[60px] text-lg">
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
            {isRegister ? 'Criar conta' : 'Entrar'}
          </Button>

          <button
            type="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className="justify-self-center rounded-full px-3 py-2 text-lg font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {isRegister ? 'Já tenho conta' : 'Criar conta'}
          </button>
        </form>
      </section>
    </main>
  )
}
