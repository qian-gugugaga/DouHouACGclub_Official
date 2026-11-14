import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { marketAPI } from '@/services/market'
import { useAuth } from '@/hooks/useAuth'
import { useOutletContext } from 'react-router-dom'
import TagFilter from '@/components/TagFilter'
import MarketDetail from './MarketDetail'
import PublishForm from './PublishForm'
import { MARKET_TAGS, MARKET_TAG_COLORS } from '@/utils/constants'

interface MarketItem {
  id: number
  title: string
  price: string
  qq: string
  tag: string
  ip: string
  images: string[]
  text: string
  author_name: string
  author_id: number
  status?: string
}

export default function Market() {
  const { user } = useAuth()
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: (mode: string) => void }>()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<MarketItem[]>([])
  const [filter, setFilter] = useState('全部')
  const [selected, setSelected] = useState<MarketItem | null>(null)
  const [showPublish, setShowPublish] = useState(false)

  const fetchItems = () => {
    const fetcher = filter === 'mine' ? marketAPI.getMyItems() : marketAPI.getItems()
    fetcher
      .then((data: any) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { fetchItems() }, [filter])

  useEffect(() => {
    const id = searchParams.get('id')
    if (id && items.length > 0) {
      const item = items.find(i => i.id === parseInt(id))
      if (item) setSelected(item)
    }
  }, [searchParams, items])

  const filtered = filter === '全部' || filter === 'mine'
    ? items
    : items.filter(i => i.tag === filter)

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>动漫集市</span>
      </div>

      <TagFilter tags={['全部', ...MARKET_TAGS]} activeTag={filter} onSelect={setFilter} showMine />

      {filter === 'mine' && !user && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)] mb-2">请先登录查看我的发布</p>
          <button onClick={() => onOpenAuth('login')} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer">去登录</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="bg-white rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
          >
            <div className="relative aspect-square bg-gray-50">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
              )}
              <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: MARKET_TAG_COLORS[item.tag] || '#f5f5f5' }}>
                {item.tag}
              </span>
              {item.ip && (
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {item.ip}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold truncate text-[var(--text)]">{item.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-[var(--accent)]">{item.price}</span>
                <span className="text-[10px] text-[var(--text-muted)]">QQ: {item.qq}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-8">暂无商品</p>
      )}

      <button
        onClick={() => {
          if (!user) { onOpenAuth('login'); return }
          setShowPublish(true)
        }}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[var(--accent)] text-white rounded-full shadow-lg border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium"
      >
        + 我要发布
      </button>

      {selected && <MarketDetail item={selected} onClose={() => setSelected(null)} />}
      {showPublish && <PublishForm onClose={() => { setShowPublish(false); fetchItems() }} />}
    </div>
  )
}
