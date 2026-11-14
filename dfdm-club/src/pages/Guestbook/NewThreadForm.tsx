import { useState } from 'react'
import { guestbookAPI } from '@/services/guestbook'
import { uploadAPI } from '@/services/upload'
import ImageUploader from '@/components/ImageUploader'

interface Props {
  onClose: () => void
}

export default function NewThreadForm({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!text.trim()) { setError('请输入内容'); return }

    setLoading(true)
    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        const uploadRes: any = await uploadAPI.uploadImages(images)
        if (uploadRes.error) { setError(uploadRes.error); setLoading(false); return }
        imageUrls = uploadRes.urls || []
      }
      const res: any = await guestbookAPI.postMessage({
        title: title.trim() || undefined,
        text: text.trim(),
        images: imageUrls,
      })
      if (res.error) { setError(res.error); setLoading(false); return }
      onClose()
    } catch {
      setError('网络错误')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer text-xl">×</button>
        <h2 className="text-lg font-bold mb-4">发帖</h2>

        {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题（可选）" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="内容" rows={5} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent)]" />
          <ImageUploader images={images} onChange={setImages} maxImages={3} />
          <button onClick={handleSubmit} disabled={loading} className="w-full py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-60">
            {loading ? '发送中...' : '发帖'}
          </button>
        </div>
      </div>
    </div>
  )
}
