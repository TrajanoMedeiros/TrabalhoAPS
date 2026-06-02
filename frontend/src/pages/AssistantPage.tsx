import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  ChevronsDown,
  Loader2,
  MessageSquareText,
  RotateCcw,
  SendHorizonal,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { Button } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { ChatMessage, Dashboard, SavingAction, Score } from '../types'
import { formatMoney, formatTime } from '../utils/format'

const groupWindowInMs = 6 * 60 * 1000

export function AssistantPage({
  messages,
  chatInput,
  dashboard,
  score,
  welcomeMessage,
  suggestions,
  saving,
  onChatInputChange,
  onClearConversation,
  onRestartConversation,
  onStartConversation,
  onSubmit,
}: {
  messages: ChatMessage[]
  chatInput: string
  dashboard: Dashboard | null
  score: Score | null
  welcomeMessage: string
  suggestions: string[]
  saving: SavingAction
  onChatInputChange: (value: string) => void
  onClearConversation: () => void
  onRestartConversation: () => void
  onStartConversation: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageCountRef = useRef(messages.length)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)
  const activeSuggestions = useMemo(
    () => (suggestions.length > 0 ? suggestions : ['Me dê um resumo financeiro rápido.']),
    [suggestions],
  )

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight
      const nearBottom = distance < 72

      setIsAtBottom(nearBottom)
      if (nearBottom) setShowJumpToLatest(false)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const previousCount = messageCountRef.current
    const hasNewMessages = messages.length > previousCount || saving === 'chat'

    if (hasNewMessages && isAtBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      setShowJumpToLatest(false)
    } else if (messages.length > previousCount) {
      setShowJumpToLatest(true)
    }

    messageCountRef.current = messages.length
  }, [isAtBottom, messages, saving])

  function scrollToLatest() {
    const container = scrollRef.current
    if (!container) return

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    setShowJumpToLatest(false)
  }

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Assistente Saldoo</h2>
                <p className="text-sm font-medium text-slate-500">
                  Insights financeiros com base nos seus dados
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={onRestartConversation}
                className="min-h-10 px-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reiniciar
              </Button>
              <Button
                variant="danger"
                onClick={onClearConversation}
                className="min-h-10 px-3 text-sm"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Limpar conversa
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="relative grid max-h-[56vh] min-h-[420px] content-start gap-3 overflow-y-auto bg-[#fbfcfe] px-5 py-5"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <EmptyConversationState
              welcomeMessage={welcomeMessage}
              suggestions={activeSuggestions}
              onStartConversation={onStartConversation}
              onSuggestionSelect={onChatInputChange}
            />
          ) : (
            messages.map((message, index) => {
              const previous = messages[index - 1]
              const next = messages[index + 1]
              const startsGroup = !previous || !isGroupedMessage(previous, message)
              const endsGroup = !next || !isGroupedMessage(message, next)
              const startsDay = !previous || !isSameDay(previous.createdAt, message.createdAt)

              return (
                <div key={`${message.role}-${message.createdAt}-${index}`}>
                  {startsDay && <DayDivider value={message.createdAt} />}
                  <MessageBubble
                    message={message}
                    startsGroup={startsGroup}
                    endsGroup={endsGroup}
                  />
                </div>
              )
            })
          )}

          {saving === 'chat' && (
            <div className="flex max-w-[90%] items-start gap-3">
              <AssistantAvatar />
              <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-700" aria-hidden="true" />
                  Analisando seu contexto...
                </span>
              </div>
            </div>
          )}

          {showJumpToLatest && (
            <button
              type="button"
              onClick={scrollToLatest}
              className="sticky bottom-0 ml-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 shadow-md transition hover:bg-slate-50"
            >
              <ChevronsDown className="h-4 w-4" aria-hidden="true" />
              Ir para o fim
            </button>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {activeSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChatInputChange(suggestion)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
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

      <aside className="grid min-w-0 content-start gap-4">
        <ContextCard
          icon={WalletCards}
          label="Saldo do período"
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
            <MessageSquareText className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <h3 className="font-black text-slate-950">Como o assistente ajuda</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ele interpreta saldo, gastos, metas e score para sugerir próximos passos objetivos e
            aplicáveis no seu dia a dia.
          </p>
        </div>
      </aside>
    </section>
  )
}

function MessageBubble({
  message,
  startsGroup,
  endsGroup,
}: {
  message: ChatMessage
  startsGroup: boolean
  endsGroup: boolean
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className={`transition ${startsGroup ? 'opacity-100' : 'opacity-0'}`}>
          <AssistantAvatar />
        </div>
      )}

      <div
        className={`max-w-[90%] px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? `${startsGroup ? 'rounded-t-2xl rounded-l-2xl rounded-br-md' : 'rounded-2xl'} ${
                endsGroup ? 'mb-1' : 'mb-0.5'
              } bg-slate-950 text-white`
            : `${startsGroup ? 'rounded-t-2xl rounded-r-2xl rounded-bl-md' : 'rounded-2xl'} ${
                endsGroup ? 'mb-1' : 'mb-0.5'
              } border border-slate-200 bg-white text-slate-700`
        }`}
      >
        <p>{message.content}</p>
        {endsGroup && (
          <p
            className={`mt-2 text-[11px] font-bold ${
              isUser ? 'text-slate-300' : 'text-slate-400'
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        )}
      </div>
    </div>
  )
}

function EmptyConversationState({
  welcomeMessage,
  suggestions,
  onStartConversation,
  onSuggestionSelect,
}: {
  welcomeMessage: string
  suggestions: string[]
  onStartConversation: () => void
  onSuggestionSelect: (value: string) => void
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <AssistantAvatar />
        <div>
          <p className="text-sm font-black text-slate-950">Conversa pronta para comecar</p>
          <p className="text-xs font-semibold text-slate-500">Onboarding inteligente da IA</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-700">{welcomeMessage}</p>

      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionSelect(suggestion)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={onStartConversation} className="min-h-11">
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reiniciar com boas-vindas
      </Button>
    </div>
  )
}

function DayDivider({ value }: { value: string }) {
  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
        {formatConversationDay(value)}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function isGroupedMessage(previous: ChatMessage, current: ChatMessage) {
  if (previous.role !== current.role) return false

  const previousTime = new Date(previous.createdAt).getTime()
  const currentTime = new Date(current.createdAt).getTime()

  return Math.abs(currentTime - previousTime) < groupWindowInMs
}

function isSameDay(previous: string, current: string) {
  return new Date(previous).toDateString() === new Date(current).toDateString()
}

function formatConversationDay(value: string) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
  }).format(date)
}
