import { useMemo, useState, type FormEvent } from 'react'
import { CircleX, Loader2, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
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
  editingCategory,
  saving,
  onProfileFormChange,
  onPasswordFormChange,
  onCategoryFormChange,
  onProfileSubmit,
  onPasswordSubmit,
  onCategorySubmit,
  onCategoryEdit,
  onCategoryEditCancel,
  onCategoryDelete,
}: {
  profileForm: ProfileForm
  passwordForm: PasswordForm
  categoryForm: CategoryForm
  categories: Category[]
  editingCategory: Category | null
  saving: SavingAction
  onProfileFormChange: (value: ProfileForm) => void
  onPasswordFormChange: (value: PasswordForm) => void
  onCategoryFormChange: (value: CategoryForm) => void
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategorySubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategoryEdit: (category: Category) => void
  onCategoryEditCancel: () => void
  onCategoryDelete: (category: Category) => void
}) {
  const [query, setQuery] = useState('')
  const customCategories = useMemo(
    () => categories.filter((category) => category.id_usuario !== null),
    [categories],
  )
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return customCategories

    return customCategories.filter((category) =>
      `${category.nome} ${category.tipo}`.toLowerCase().includes(normalizedQuery),
    )
  }, [customCategories, query])
  const isEditingCategory = editingCategory !== null

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

      <Panel title={isEditingCategory ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={onCategorySubmit} className="grid gap-4">
          {isEditingCategory && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Edicao em andamento. Salve para persistir as alteracoes.
            </div>
          )}

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
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving === 'category'}>
              {saving === 'category' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {isEditingCategory ? 'Salvar alteracoes' : 'Criar categoria'}
            </Button>
            {isEditingCategory && (
              <Button type="button" variant="ghost" onClick={onCategoryEditCancel}>
                <CircleX className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Categorias personalizadas">
        {customCategories.length > 0 ? (
          <div className="grid gap-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar categoria"
                className={`${inputClass} pl-9`}
              />
            </label>

            {filteredCategories.map((category) => (
              <div
                key={category.id_categoria}
                className={`flex flex-wrap items-start justify-between gap-3 border-b pb-3 last:border-0 ${
                  editingCategory?.id_categoria === category.id_categoria
                    ? 'rounded-2xl border-amber-200 bg-amber-50/40 p-3'
                    : 'border-slate-100'
                }`}
              >
                <div>
                  <p className="font-black text-slate-950">{category.nome}</p>
                  <p className="text-sm font-bold text-slate-500">{category.tipo}</p>
                </div>
                <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                  <Button
                    variant="ghost"
                    onClick={() => onCategoryEdit(category)}
                    disabled={saving === 'category'}
                    className="min-h-10 px-3"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onCategoryDelete(category)}
                    disabled={saving === 'delete'}
                    className="min-h-10 px-3"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <EmptyState>Nenhuma categoria encontrada para o filtro atual.</EmptyState>
            )}
          </div>
        ) : (
          <EmptyState>As categorias padrao ja estao disponiveis para uso.</EmptyState>
        )}
      </Panel>
    </section>
  )
}
