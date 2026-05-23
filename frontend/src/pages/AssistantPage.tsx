import { type FormEvent, useEffect, useRef } from 'react'
import {
  Bot,
  Loader2,
  MessageSquareText,
  SendHorizonal,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { Button } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { ChatMessage, Dashboard, SavingAction, Score } from '../types'
import { formatMoney } from '../utils/format'

const suggestions = [
  'Como posso economizar este mes?',
  'Explique meu score financeiro',
  'Qual prioridade para minhas metas?',
]

export function AssistantPage({
  messages,
  chatInput,
  dashboard,
  score,
  saving,
  onChatInputChange,
  onSubmit,
}: {
  messages: ChatMessage[]
  chatInput: string
  dashboard: Dashboard | null
  score: Score | null
  saving: SavingAction
  onChatInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, saving])

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22c55e] text-white">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Assistente Saldoo</h2>
              <p className="text-sm font-medium text-slate-500">
                Insights financeiros com base nos seus dados
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="grid max-h-[56vh] min-h-[420px] gap-4 overflow-y-auto bg-[#fbfcf8] px-5 py-5"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}`} message={message} />
          ))}

          {saving === 'chat' && (
            <div className="flex max-w-[86%] items-start gap-3">
              <AssistantAvatar />
              <div className="rounded-2xl rounded-tl-md border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" aria-hidden="true" />
                  Analisando seu contexto...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChatInputChange(suggestion)}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800 transition hover:border-emerald-200 hover:bg-emerald-100"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={chatInput}
              onChange={(event) => onChatInputChange(event.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="Pergunte sobre gastos, metas ou score"
              aria-label="Mensagem para o assistente"
            />
            <Button type="submit" disabled={saving === 'chat' || chatInput.trim().length < 3}>
              {saving === 'chat' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <SendHorizonal className="h-4 w-4" aria-hidden="true" />
              )}
              Enviar
            </Button>
          </form>
        </div>
      </div>

      <aside className="grid gap-4 content-start">
        <ContextCard
          icon={WalletCards}
          label="Saldo do periodo"
          value={formatMoney(dashboard?.saldo_atual ?? 0)}
        />
        <ContextCard
          icon={TrendingUp}
          label="Economia"
          value={`${Number(dashboard?.taxa_economia ?? 0).toFixed(1)}%`}
        />
        <ContextCard icon={Sparkles} label="Score" value={String(score?.score ?? '--')} />
        <ContextCard
          icon={Target}
          label="Metas"
          value={`${dashboard?.metas.total ?? 0} ativas`}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <h3 className="font-black text-slate-950">Como o assistente ajuda</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ele interpreta saldo, gastos, metas e score para sugerir proximos passos simples dentro
            do Saldoo.
          </p>
        </div>
      </aside>
    </section>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AssistantAvatar />}
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? 'rounded-tr-md bg-slate-950 text-white'
            : 'rounded-tl-md border border-emerald-100 bg-white text-slate-700'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
      <Bot className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}

function ContextCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}
