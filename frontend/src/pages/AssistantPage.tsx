import type { FormEvent } from 'react'
import { Loader2, MessageSquareText } from 'lucide-react'
import { Button, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { ChatMessage, SavingAction } from '../types'

export function AssistantPage({
  messages,
  chatInput,
  saving,
  onChatInputChange,
  onSubmit,
}: {
  messages: ChatMessage[]
  chatInput: string
  saving: SavingAction
  onChatInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.45fr]">
      <Panel title="Conversa">
        <div className="grid max-h-[58vh] gap-3 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'ml-auto bg-slate-950 text-white'
                  : 'bg-emerald-50 text-slate-800'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="Ex.: Como posso economizar este mes?"
            aria-label="Mensagem para o assistente"
          />
          <Button type="submit" disabled={saving === 'chat'}>
            {saving === 'chat' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            )}
            Enviar
          </Button>
        </form>
      </Panel>

      <Panel title="Contexto usado">
        <div className="grid gap-3 text-sm leading-6 text-slate-600">
          <p>
            O assistente responde com base no dashboard, no score e nos lancamentos registrados na
            sua conta.
          </p>
          <p>Para respostas melhores, mantenha receitas, despesas, metas e categorias atualizadas.</p>
        </div>
      </Panel>
    </section>
  )
}
