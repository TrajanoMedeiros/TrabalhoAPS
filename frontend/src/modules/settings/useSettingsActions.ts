import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import { initialCategoryForm, initialPasswordForm } from '../../stores/forms'
import type { Category, CategoryForm, PasswordForm, ProfileForm, SavingAction, User } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type SettingsActionDependencies = {
  categoryForm: CategoryForm
  editingCategory: Category | null
  passwordForm: PasswordForm
  profileForm: ProfileForm
  request: ApiRequest
  refreshData: () => Promise<void>
  setEditingCategory: Setter<Category | null>
  setCategoryForm: Setter<CategoryForm>
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setPasswordForm: Setter<PasswordForm>
  setSaving: Setter<SavingAction>
  setUser: Setter<User | null>
  syncProfileForm: (user: User) => void
}

export function useSettingsActions({
  categoryForm,
  editingCategory,
  passwordForm,
  profileForm,
  request,
  refreshData,
  setEditingCategory,
  setCategoryForm,
  setError,
  setNotice,
  setPasswordForm,
  setSaving,
  setUser,
  syncProfileForm,
}: SettingsActionDependencies) {
  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const isEditing = editingCategory !== null

    setSaving('category')
    setError(null)
    setNotice(null)

    try {
      await request(
        isEditing ? `/api/categories/${editingCategory.id_categoria}` : '/api/categories',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(categoryForm),
        },
      )

      setCategoryForm(initialCategoryForm)
      setEditingCategory(null)
      setNotice(isEditing ? 'Categoria atualizada.' : 'Categoria criada.')
      await refreshData()
    } catch (categoryError) {
      setError(
        getErrorMessage(
          categoryError,
          isEditing
            ? 'Nao foi possivel atualizar a categoria.'
            : 'Nao foi possivel criar a categoria.',
        ),
      )
    } finally {
      setSaving(null)
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!window.confirm('Remover esta categoria?')) return

    setSaving('delete')
    setError(null)
    setNotice(null)

    try {
      await request(`/api/categories/${category.id_categoria}`, { method: 'DELETE' })

      if (editingCategory && editingCategory.id_categoria === category.id_categoria) {
        setCategoryForm(initialCategoryForm)
        setEditingCategory(null)
      }

      setNotice('Categoria removida.')
      await refreshData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Nao foi possivel remover a categoria.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('profile')
    setError(null)
    setNotice(null)

    try {
      const payload = await request<{ user: User }>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      })
      setUser(payload.user)
      syncProfileForm(payload.user)
      setNotice('Perfil atualizado.')
    } catch (profileError) {
      setError(getErrorMessage(profileError, 'Nao foi possivel atualizar o perfil.'))
    } finally {
      setSaving(null)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('password')
    setError(null)
    setNotice(null)

    try {
      await request('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      })
      setPasswordForm(initialPasswordForm)
      setNotice('Senha atualizada.')
    } catch (passwordError) {
      setError(getErrorMessage(passwordError, 'Nao foi possivel atualizar a senha.'))
    } finally {
      setSaving(null)
    }
  }

  return {
    handleCategorySubmit,
    handleDeleteCategory,
    handlePasswordSubmit,
    handleProfileSubmit,
  }
}
