import { Bot, LayoutDashboard, ReceiptText, Settings, Target, type LucideIcon } from 'lucide-react'
import type { View } from '../types'

export type NavigationItem = {
  key: View
  label: string
  icon: LucideIcon
}

export const navItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Lancamentos', icon: ReceiptText },
  { key: 'goals', label: 'Metas', icon: Target },
  { key: 'assistant', label: 'Assistente', icon: Bot },
  { key: 'settings', label: 'Ajustes', icon: Settings },
]
