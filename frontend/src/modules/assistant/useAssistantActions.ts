import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import type { ChatMessage, ChatPayload, SavingAction } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type AssistantActionDependencies = {
  chatInput: string
  request: ApiRequest
  setChatInput: Setter<string>
  setChatMessages: Setter<ChatMessage[]>
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
}

export function useAssistantActions({
  chatInput,
  request,
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
    setChatMessages((current) => [...current, { role: 'user', content: message }])

    try {
      const payload = await request<ChatPayload>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ mensagem: message }),
      })
      setChatMessages((current) => [
        ...current,
        { role: 'assistant', content: payload.chat.resposta },
      ])
    } catch (chatError) {
      setError(getErrorMessage(chatError, 'Nao foi possivel responder agora.'))
    } finally {
      setSaving(null)
    }
  }

  return { handleChatSubmit }
}
