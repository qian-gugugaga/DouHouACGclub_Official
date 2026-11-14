import { useState, useEffect } from 'react'
import { adminAPI } from '@/services/admin'

export default function AnnouncementManage({ onBack }: { onBack: () => void }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnnouncements = () => {
    fetch('/api/announcements').then(r => r.json()).then((d: any) => setAnnouncements(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      if (editingId) await adminAPI.updateAnnouncement(editingId, { content: content.trim() })
      else await adminAPI.createAnnouncement({ content: content.trim() })
      setContent(''); setEditingId(null); fetchAnnouncements()
    } catch {}
    setLoading(false)
  }

  const handleEdit = (a: any) => { setEditingId(a.id); setContent(a.content) }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    await adminAPI.deleteAnnouncement(id).catch(() => {})
    fetchAnnouncements()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">公告管理</h2>

      <div className="flex gap-2 mb-6">
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="公告内容" className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">{editingId ? '更新' : '发布'}</button>
        {editingId && <button onClick={() => { setEditingId(null); setContent('') }} className="px-3 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer">取消</button>}
      </div>

      <div className="space-y-2">
        {announcements.map((a: any) => (
          <div key={a.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[var(--border)]">
            <div className="flex-1 text-sm">{a.content}</div>
            <button onClick={() => handleEdit(a)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border-none cursor-pointer">编辑</button>
            <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border-none cursor-pointer">删除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
