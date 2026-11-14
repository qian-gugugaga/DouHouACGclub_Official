import { useEffect } from 'react'
import ImageCarousel from '@/components/ImageCarousel'
import CommentSection from '@/components/CommentSection'

interface MarketItem {
  id: number
  title: string
  price: string
  qq: string
  tag: string
  ip: string
  images: string[]
  text: string
}

interface Props {
  item: MarketItem
  onClose: () => void
}

export default function MarketDetail({ item, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border-none cursor-pointer text-lg text-[var(--text-muted)] hover:text-[var(--text)]">×</button>

        <ImageCarousel images={item.images || []} />

        <div className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">{item.tag}</span>
            {item.ip && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{item.ip}</span>}
          </div>
          <h2 className="text-lg font-bold text-[var(--text)] mb-1">{item.title}</h2>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-lg font-bold text-[var(--accent)]">{item.price}</span>
            <span className="text-sm text-[var(--text-muted)]">QQ: <strong>{item.qq}</strong></span>
          </div>
          {item.text && <p className="text-sm text-[var(--text-light)] mb-4 whitespace-pre-wrap">{item.text}</p>}
          <CommentSection targetType="market" targetId={item.id} />
        </div>
      </div>
    </div>
  )
}
