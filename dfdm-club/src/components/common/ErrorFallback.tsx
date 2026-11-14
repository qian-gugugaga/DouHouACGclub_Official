interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-5xl">😢</div>
      <h2 className="text-lg font-semibold text-[var(--text)]">页面出了点问题</h2>
      <p className="text-sm text-[var(--text-muted)]">{error?.message || '未知错误'}</p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
        >
          重试
        </button>
      )}
    </div>
  )
}
