import type { FormEvent } from 'react'
import { Loader2, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { SelectInput } from '../components/form/SelectInput'
import { Button, EmptyState, Field, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type {
  Category,
  CategoryForm,
  PasswordForm,
  ProfileForm,
  SavingAction,
  User,
} from '../types'

export function SettingsPage({
  profileForm,
  passwordForm,
  categoryForm,
  categories,
  saving,
  onProfileFormChange,
  onPasswordFormChange,
  onCategoryFormChange,
  onProfileSubmit,
  onPasswordSubmit,
  onCategorySubmit,
  onCategoryDelete,
}: {
  profileForm: ProfileForm
  passwordForm: PasswordForm
  categoryForm: CategoryForm
  categories: Category[]
  saving: SavingAction
  onProfileFormChange: (value: ProfileForm) => void
  onPasswordFormChange: (value: PasswordForm) => void
  onCategoryFormChange: (value: CategoryForm) => void
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategorySubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategoryDelete: (category: Category) => void
}) {
  const customCategories = categories.filter((category) => category.id_usuario !== null)

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-2">
      <Panel title="Perfil">
        <form onSubmit={onProfileSubmit} className="grid gap-4">
          <Field label="Nome">
            <input
              required
              minLength={2}
              value={profileForm.nome}
              onChange={(event) => onProfileFormChange({ ...profileForm, nome: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                onProfileFormChange({ ...profileForm, email: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Tipo de conta">
            <SelectInput
              value={profileForm.tipo_usuario}
              ariaLabel="Tipo de conta"
              onChange={(tipo_usuario) =>
                onProfileFormChange({
                  ...profileForm,
                  tipo_usuario: tipo_usuario as User['tipo_usuario'],
                })
              }
              options={[
                { value: 'personal', label: 'Pessoa fisica' },
                { value: 'business', label: 'Negocio' },
              ]}
            />
          </Field>
          <Button type="submit" disabled={saving === 'profile'}>
            {saving === 'profile' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserRound className="h-4 w-4" aria-hidden="true" />
            )}
            Salvar perfil
          </Button>
        </form>
      </Panel>

      <Panel title="Seguranca">
        <form onSubmit={onPasswordSubmit} className="grid gap-4">
          <Field label="Senha atual">
            <input
              required
              type="password"
              value={passwordForm.senha_atual}
              onChange={(event) =>
                onPasswordFormChange({ ...passwordForm, senha_atual: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Nova senha">
            <input
              required
              type="password"
              minLength={8}
              value={passwordForm.nova_senha}
              onChange={(event) =>
                onPasswordFormChange({ ...passwordForm, nova_senha: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Button type="submit" disabled={saving === 'password'}>
            {saving === 'password' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            Atualizar senha
          </Button>
        </form>
      </Panel>

      <Panel title="Nova categoria">
        <form onSubmit={onCategorySubmit} className="grid gap-4">
          <Field label="Nome">
            <input
              required
              minLength={2}
              value={categoryForm.nome}
              onChange={(event) =>
                onCategoryFormChange({ ...categoryForm, nome: event.target.value })
              }
              className={inputClass}
              placeholder="Ex.: Estudos"
            />
          </Field>
          <Field label="Tipo">
            <SelectInput
              value={categoryForm.tipo}
              ariaLabel="Tipo da categoria"
              onChange={(tipo) =>
                onCategoryFormChange({
                  ...categoryForm,
                  tipo: tipo as Category['tipo'],
                })
              }
              options={[
                { value: 'expense', label: 'Despesa' },
                { value: 'income', label: 'Receita' },
                { value: 'both', label: 'Ambos' },
              ]}
            />
          </Field>
          <Button type="submit" disabled={saving === 'category'}>
            {saving === 'category' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            Criar categoria
          </Button>
        </form>
      </Panel>

      <Panel title="Categorias personalizadas">
        {customCategories.length > 0 ? (
          <div className="grid gap-3">
            {customCategories.map((category) => (
              <div
                key={category.id_categoria}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
              >
                <div>
                  <p className="font-black text-slate-950">{category.nome}</p>
                  <p className="text-sm font-bold text-slate-500">{category.tipo}</p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => onCategoryDelete(category)}
                  disabled={saving === 'delete'}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>As categorias padrao ja estao disponiveis para uso.</EmptyState>
        )}
      </Panel>
    </section>
  )
}
