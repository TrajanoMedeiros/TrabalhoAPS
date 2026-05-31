import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import { buildLocalAssistantReply, createChatMessage } from './chatExperience'
import type { ChatMessage, ChatPayload, Dashboard, SavingAction, Score } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type AssistantActionDependencies = {
  chatInput: string
  dashboard: Dashboard | null
  request: ApiRequest
  score: Score | null
  setChatInput: Setter<string>
  setChatMessages: Setter<ChatMessage[]>
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
}

export function useAssistantActions({
  chatInput,
  dashboard,
  request,
  score,
  setChatInput,
  setChatMessages,
  setError,
  setNotice,
  setSaving,
}: AssistantActionDependencies) {
  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message) return

    setSaving('chat')
    setError(null)
    setNotice(null)
    setChatInput('')
    setChatMessages((current) => [...current, createChatMessage('user', message)])

    try {
      const payload = await request<ChatPayload>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ mensagem: message }),
      })
      setChatMessages((current) => [...current, createChatMessage('assistant', payload.chat.resposta)])
    } catch (chatError) {
      const fallbackResponse = buildLocalAssistantReply(message, { dashboard, score })
      setChatMessages((current) => [
        ...current,
        createChatMessage('assistant', fallbackResponse),
      ])
      setNotice('Instabilidade na API detectada. Continuei com analise local inteligente.')
      if (!dashboard || !score) {
        setError(getErrorMessage(chatError, 'Nao foi possivel responder agora.'))
      }
    } finally {
      setSaving(null)
    }
  }

  return { handleChatSubmit }
}
