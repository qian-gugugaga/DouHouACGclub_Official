import { useState, useEffect } from 'react'
import { monthlyAPI } from '@/services/monthly'
import { uploadAPI } from '@/services/upload'
import ImageUploader from '@/components/ImageUploader'

export default function MonthlyPublish({ onBack }: { onBack: () => void }) {
  const [issues, setIssues] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [cover, setCover] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchIssues = () => {
    monthlyAPI.getIssues().then((d: any) => setIssues(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { fetchIssues() }, [])

  const resetForm = () => {
    setEditing(null); setTitle(''); setPublishDate(''); setCover(''); setContent(''); setImages([]); setMsg('')
  }

  const handleEdit = (issue: any) => {
    setEditing(issue); setTitle(issue.title); setPublishDate(issue.publish_date?.split('T')[0] || ''); setCover(issue.cover || ''); setContent(issue.content || ''); setImages(issue.images || [])
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const res: any = await uploadAPI.uploadImages([reader.result as string])
      if (res.urls?.[0]) setCover(res.urls[0])
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setMsg('请输入标题'); return }
    setLoading(true)
    const data = { title: title.trim(), publish_date: publishDate, cover, content, images }
    try {
      if (editing) {
        await monthlyAPI.updateIssue(editing.id, data)
        setMsg('已更新')
      } else {
        await monthlyAPI.createIssue(data)
        setMsg('已发布')
      }
      resetForm()
      fetchIssues()
    } catch { setMsg('操作失败') }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    await monthlyAPI.deleteIssue(id).catch(() => {})
    fetchIssues()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">{editing ? '编辑月刊' : '发布月刊'}</h2>

      {msg && <div className="mb-3 p-2 bg-blue-50 text-blue-700 text-sm rounded-lg text-center">{msg}</div>}

      <div className="space-y-3 mb-6">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <input value={publishDate} onChange={e => setPublishDate(e.target.value)} type="date" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">封面图</label>
          {cover && <img src={cover} alt="" className="w-32 h-20 object-cover rounded-lg mb-2" />}
          <label className="text-xs text-[var(--accent)] cursor-pointer">
            上传封面
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="正文内容（用 {{img:0}}, {{img:1}} 插入图片）" rows={6} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none" />
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">内容图片</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">
            {loading ? '...' : editing ? '更新' : '发布'}
          </button>
          {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer">取消</button>}
        </div>
      </div>

      <h3 className="font-semibold mb-2">已有月刊</h3>
      <div className="space-y-2">
        {issues.map((issue: any) => (
          <div key={issue.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[var(--border)]">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{issue.title}</div>
              <div className="text-xs text-[var(--text-muted)]">{issue.publish_date}</div>
            </div>
            <button onClick={() => handleEdit(issue)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border-none cursor-pointer">编辑</button>
            <button onClick={() => handleDelete(issue.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border-none cursor-pointer">删除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
