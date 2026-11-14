import { useEffect } from 'react'
import { formatDate } from '@/utils/format'

interface Activity {
  id: number
  title: string
  event_date: string
  status: string
  description: string
}

interface Props {
  activity: Activity
  onClose: () => void
}

export default function ActivityDetail({ activity, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const statusMap: Record<string, { label: string; color: string }> = {
    upcoming: { label: '即将开始', color: 'bg-green-100 text-green-700' },
    ongoing: { label: '进行中', color: 'bg-orange-100 text-orange-700' },
    past: { label: '已结束', color: 'bg-gray-100 text-gray-500' },
  }
  const status = statusMap[activity.status] || statusMap.past

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer text-xl">×</button>
        <h2 className="text-lg font-bold mb-2">{activity.title}</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          <span className="text-xs text-[var(--text-muted)]">{formatDate(activity.event_date)}</span>
        </div>
        <p className="text-sm text-[var(--text-light)] whitespace-pre-wrap">{activity.description}</p>
      </div>
    </div>
  )
}
