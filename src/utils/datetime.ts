export function formatTimestampShort(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return date.toLocaleString()
  }
}

export function formatTimeHm(date: Date): string {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return date.toLocaleTimeString()
  }
}

