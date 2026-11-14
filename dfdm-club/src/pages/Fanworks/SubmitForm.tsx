import { useState } from 'react'
import { fanworksAPI } from '@/services/fanworks'
import { uploadAPI } from '@/services/upload'
import ImageUploader from '@/components/ImageUploader'

interface Props {
  onClose: () => void
}

const TAG1_OPTIONS = ['原创', '同人']
const TAG2_OPTIONS = ['文章', '画', 'COS', '其他']

export default function SubmitForm({ onClose }: Props) {
  const [tag1, setTag1] = useState('')
  const [tag2, setTag2] = useState('')
  const [cn, setCN] = useState('')
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!tag1) { setError('请选择创作性质'); return }
    if (!tag2) { setError('请选择作品类型'); return }
    if (images.length === 0) { setError('请上传图片'); return }
    if (!text.trim()) { setError('请输入正文'); return }

    setLoading(true)
    try {
      const uploadRes: any = await uploadAPI.uploadImages(images)
      if (uploadRes.error) { setError(uploadRes.error); setLoading(false); return }
      const urls = uploadRes.urls || []
      const res: any = await fanworksAPI.submitWork({ tag1, tag2, cn, images: urls, text: text.trim() })
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
        <h2 className="text-lg font-bold mb-4">投稿作品</h2>

        {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">创作性质</p>
            <div className="flex gap-2">
              {TAG1_OPTIONS.map(t => (
                <button key={t} onClick={() => setTag1(t)} className={`px-3 py-1.5 rounded-full text-xs border cursor-pointer ${tag1 === t ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white text-[var(--text-light)] border-[var(--border)]'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">作品类型</p>
            <div className="flex flex-wrap gap-2">
              {TAG2_OPTIONS.map(t => (
                <button key={t} onClick={() => setTag2(t)} className={`px-3 py-1.5 rounded-full text-xs border cursor-pointer ${tag2 === t ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white text-[var(--text-light)] border-[var(--border)]'}`}>{t}</button>
              ))}
            </div>
          </div>

          <input value={cn} onChange={e => setCN(e.target.value)} placeholder="CN名（可选）" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />

          <ImageUploader images={images} onChange={setImages} />

          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="正文" rows={4} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent)]" />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {loading ? '提交中...' : '提交投稿'}
          </button>
        </div>
      </div>
    </div>
  )
}
