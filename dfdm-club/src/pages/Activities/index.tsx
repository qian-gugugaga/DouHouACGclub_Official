import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { activitiesAPI } from '@/services/activities'
import { formatDate } from '@/utils/format'
import TagFilter from '@/components/TagFilter'
import ActivityDetail from './ActivityDetail'

interface Activity {
  id: number
  title: string
  event_date: string
  status: string
  description: string
}

const FILTERS = ['全部', '即将开始', '进行中', '已结束']
const statusMap: Record<string, string> = { '即将开始': 'upcoming', '进行中': 'ongoing', '已结束': 'past' }

function getStatusInfo(status: string) {
  if (status === 'upcoming') return { label: '即将开始', color: 'bg-green-100 text-green-700' }
  if (status === 'ongoing') return { label: '进行中', color: 'bg-orange-100 text-orange-700' }
  return { label: '已结束', color: 'bg-gray-100 text-gray-500' }
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState('全部')
  const [selected, setSelected] = useState<Activity | null>(null)

  useEffect(() => {
    activitiesAPI.getActivities()
      .then((data: any) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filtered = filter === '全部'
    ? activities
    : activities.filter(a => a.status === statusMap[filter])

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>活动合集</span>
      </div>

      <TagFilter tags={FILTERS} activeTag={filter} onSelect={setFilter} />

      <div className="relative pl-6 border-l-2 border-[var(--accent)]/20 space-y-4">
        {filtered.map((a) => {
          const status = getStatusInfo(a.status)
          return (
            <div key={a.id} className="relative cursor-pointer" onClick={() => setSelected(a)}>
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
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">暂无活动</p>
        )}
      </div>

      {selected && <ActivityDetail activity={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
