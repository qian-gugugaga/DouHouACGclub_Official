import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { activitiesAPI } from '@/services/activities'
import { formatDate } from '@/utils/format'

interface Activity {
  id: number
  title: string
  event_date: string
  status: string
  description: string
}

function getStatusInfo(status: string) {
  if (status === 'upcoming') return { label: '即将开始', color: 'bg-green-100 text-green-700' }
  if (status === 'ongoing') return { label: '进行中', color: 'bg-orange-100 text-orange-700' }
  return { label: '已结束', color: 'bg-gray-100 text-gray-500' }
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    activitiesAPI.getActivities()
      .then((data: any) => setActivities(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {})
  }, [])

  if (activities.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--text)]">近期活动</h2>
        <Link to="/activities" className="text-sm text-[var(--accent)] no-underline hover:underline">查看全部 →</Link>
      </div>
      <div className="relative pl-6 border-l-2 border-[var(--accent)]/20 space-y-4">
        {activities.map((a) => {
          const status = getStatusInfo(a.status)
          return (
            <div key={a.id} className="relative">
              <div className="absolute -left-[25px] top-2 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-white shadow-sm" />
              <div className="bg-white rounded-lg p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-[var(--text)]">{a.title}</h3>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(a.event_date)}</p>
                <p className="text-xs text-[var(--text-light)] mt-1 line-clamp-2">{a.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
