import type {
  AuthForm,
  CategoryForm,
  ChatMessage,
  GoalForm,
  PasswordForm,
  ProfileForm,
  TransactionForm,
} from '../types'

export const tokenKey = 'saldoo.auth.token'
export const today = new Date().toISOString().slice(0, 10)
export const currentMonth = new Date().getMonth() + 1
export const currentYear = new Date().getFullYear()

export const initialAuthForm: AuthForm = {
  nome: '',
  email: '',
  senha: '',
  tipo_usuario: 'personal',
}

export const initialTransactionForm: TransactionForm = {
  kind: 'expense',
  valor: '',
  data: today,
  descricao: '',
  id_categoria: '',
}

export const initialGoalForm: GoalForm = {
  titulo: '',
  valor_alvo: '',
  valor_atual: '',
  data_limite: '',
  id_categoria: '',
}

export const initialCategoryForm: CategoryForm = {
  nome: '',
  tipo: 'expense',
}

export const initialProfileForm: ProfileForm = {
  nome: '',
  email: '',
  tipo_usuario: 'personal',
}

export const initialPasswordForm: PasswordForm = {
  senha_atual: '',
  nova_senha: '',
}

export const initialChatMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Me conte sua duvida financeira e eu respondo usando seus dados do Saldoo.',
    createdAt: new Date().toISOString(),
  },
]
