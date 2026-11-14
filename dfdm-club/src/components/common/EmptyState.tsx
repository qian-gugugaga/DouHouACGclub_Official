interface EmptyStateProps {
  icon?: string
  message: string
}

export default function EmptyState({ icon = '📭', message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="text-4xl">{icon}</div>
      <p className="text-[var(--text-muted)] text-sm">{message}</p>
    </div>
  )
}
