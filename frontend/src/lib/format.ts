export const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatMoney(value: number | string | null | undefined): string {
  return money.format(Number(value ?? 0))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sem prazo'

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

export function monthName(value: number): string {
  return (
    [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ][value - 1] ?? String(value)
  )
}
