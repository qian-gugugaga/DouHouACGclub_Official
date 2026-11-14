import { useState, useEffect } from 'react'
import { activitiesAPI } from '@/services/activities'

export default function ActivityManage({ onBack }: { onBack: () => void }) {
  const [activities, setActivities] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('upcoming')
  const [loading, setLoading] = useState(false)

  const fetchActivities = () => {
    activitiesAPI.getActivities().then((d: any) => setActivities(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { fetchActivities() }, [])

  const resetForm = () => { setEditing(null); setTitle(''); setEventDate(''); setDescription(''); setStatus('upcoming') }

  const handleEdit = (a: any) => {
    setEditing(a); setTitle(a.title); setEventDate(a.event_date?.split('T')[0] || ''); setDescription(a.description || ''); setStatus(a.status || 'upcoming')
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setLoading(true)
    const data = { title: title.trim(), event_date: eventDate, description, status }
    try {
      if (editing) await activitiesAPI.updateActivity(editing.id, data)
      else await activitiesAPI.createActivity(data)
      resetForm(); fetchActivities()
    } catch {}
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    await activitiesAPI.deleteActivity(id).catch(() => {})
    fetchActivities()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">活动管理</h2>

      <div className="space-y-3 mb-6">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="活动标题" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <input value={eventDate} onChange={e => setEventDate(e.target.value)} type="date" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="活动描述" rows={3} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm">
          <option value="upcoming">即将开始</option>
          <option value="ongoing">进行中</option>
          <option value="past">已结束</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">{loading ? '...' : editing ? '更新' : '创建'}</button>
          {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer">取消</button>}
        </div>
      </div>

      <div className="space-y-2">
        {activities.map((a: any) => (
          <div key={a.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[var(--border)]">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{a.title}</div>
              <div className="text-xs text-[var(--text-muted)]">{a.event_date} · {a.status}</div>
            </div>
            <button onClick={() => handleEdit(a)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border-none cursor-pointer">编辑</button>
            <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border-none cursor-pointer">删除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
