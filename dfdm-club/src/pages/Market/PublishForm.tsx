import { useState } from 'react'
import { marketAPI } from '@/services/market'
import { uploadAPI } from '@/services/upload'
import ImageUploader from '@/components/ImageUploader'
import { MARKET_TAGS } from '@/utils/constants'

interface Props {
  onClose: () => void
}

export default function PublishForm({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [qq, setQQ] = useState('')
  const [tag, setTag] = useState('')
  const [ip, setIP] = useState('')
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePriceBlur = () => {
    if (price && !price.startsWith('￥') && !price.startsWith('¥')) {
      setPrice('￥' + price)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) { setError('请输入名称'); return }
    if (!price.trim()) { setError('请输入价格'); return }
    if (!tag) { setError('请选择类型'); return }
    if (images.length === 0) { setError('请上传图片'); return }

    setLoading(true)
    try {
      const uploadRes: any = await uploadAPI.uploadImages(images)
      if (uploadRes.error) { setError(uploadRes.error); setLoading(false); return }
      const urls = uploadRes.urls || []
      const res: any = await marketAPI.createItem({ title: title.trim(), price: price.trim(), qq: qq.trim(), tag, ip: ip.trim(), images: urls, text: text.trim() })
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
        <h2 className="text-lg font-bold mb-4">发布商品</h2>

        {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="名称" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          <input value={price} onChange={e => setPrice(e.target.value)} onBlur={handlePriceBlur} placeholder="价格" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          <input value={qq} onChange={e => setQQ(e.target.value)} placeholder="QQ号" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          <input value={ip} onChange={e => setIP(e.target.value)} placeholder="IP（可选）" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">物品类型</p>
            <div className="flex flex-wrap gap-1.5">
              {MARKET_TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1 rounded-full text-xs border cursor-pointer transition-all ${tag === t ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white text-[var(--text-light)] border-[var(--border)]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ImageUploader images={images} onChange={setImages} />

          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="描述（可选）" rows={3} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent)]" />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {loading ? '提交中...' : '提交发布'}
          </button>
        </div>
      </div>
    </div>
  )
}
