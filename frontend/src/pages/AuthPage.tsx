import type { FormEvent } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Alert } from '../components/Alert'
import { Brand } from '../components/Brand'
import { Button, Field } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { AuthForm, AuthMode, User } from '../types'

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
  return (
    <main className="grid min-h-screen bg-[#f6f7f2] text-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-[340px] flex-col justify-between bg-slate-950 p-6 text-white sm:p-10 lg:min-h-screen">
        <Brand inverted />
        <div className="max-w-2xl py-10">
          <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-300">
            Controle financeiro pessoal
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Saldoo organiza gastos, metas e decisoes em uma rotina simples.
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-300">
            Registre receitas e despesas, acompanhe seu score e receba orientacoes com base nos
            dados reais da sua conta.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <AuthMetric label="Controle" value="Mensal" />
          <AuthMetric label="Metas" value="Progresso" />
          <AuthMetric label="Assistente" value="Contextual" />
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <form
          onSubmit={onSubmit}
          className="grid w-full max-w-md gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <p className="text-sm font-bold text-slate-500">
              {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">
              {authMode === 'login' ? 'Entrar no Saldoo' : 'Comecar agora'}
            </h2>
          </div>

          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onAuthModeChange('login')}
              className={`rounded-md px-3 py-2 text-sm font-extrabold transition ${
                authMode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onAuthModeChange('register')}
              className={`rounded-md px-3 py-2 text-sm font-extrabold transition ${
                authMode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Cadastro
            </button>
          </div>

          {error && (
            <Alert tone="error" icon={ShieldCheck}>
              {error}
            </Alert>
          )}

          {authMode === 'register' && (
            <Field label="Nome">
              <input
                required
                minLength={2}
                value={authForm.nome}
                onChange={(event) => onAuthFormChange({ ...authForm, nome: event.target.value })}
                className={inputClass}
                placeholder="Seu nome"
              />
            </Field>
          )}

          <Field label="Email">
            <input
              required
              type="email"
              value={authForm.email}
              onChange={(event) => onAuthFormChange({ ...authForm, email: event.target.value })}
              className={inputClass}
              placeholder="voce@email.com"
            />
          </Field>

          <Field label="Senha">
            <input
              required
              type="password"
              minLength={authMode === 'register' ? 8 : undefined}
              value={authForm.senha}
              onChange={(event) => onAuthFormChange({ ...authForm, senha: event.target.value })}
              className={inputClass}
              placeholder={authMode === 'register' ? 'Minimo 8 caracteres' : 'Sua senha'}
            />
          </Field>

          {authMode === 'register' && (
            <Field label="Perfil">
              <select
                value={authForm.tipo_usuario}
                onChange={(event) =>
                  onAuthFormChange({
                    ...authForm,
                    tipo_usuario: event.target.value as User['tipo_usuario'],
                  })
                }
                className={inputClass}
              >
                <option value="personal">Pessoa fisica</option>
                <option value="business">Negocio</option>
              </select>
            </Field>
          )}

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </section>
    </main>
  )
}

function AuthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  )
}
