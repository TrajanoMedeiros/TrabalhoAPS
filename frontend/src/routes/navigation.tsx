import { Bot, LayoutDashboard, ReceiptText, Settings, Target, type LucideIcon } from 'lucide-react'
import type { View } from '../types'

export type NavigationItem = {
  key: View
  label: string
  mobileLabel: string
  icon: LucideIcon
}

export const navItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', mobileLabel: 'Início', icon: LayoutDashboard },
  { key: 'transactions', label: 'Lançamentos', mobileLabel: 'Lanç.', icon: ReceiptText },
  { key: 'goals', label: 'Metas', mobileLabel: 'Metas', icon: Target },
  { key: 'assistant', label: 'Assistente', mobileLabel: 'IA', icon: Bot },
  { key: 'settings', label: 'Ajustes', mobileLabel: 'Ajustes', icon: Settings },
]
