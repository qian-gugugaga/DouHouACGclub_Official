import { useState, useEffect } from 'react'
import { fanworksAPI } from '@/services/fanworks'
import { marketAPI } from '@/services/market'

interface Props {
  type: 'fanworks' | 'market'
  onBack: () => void
}

export default function ReviewQueue({ type, onBack }: Props) {
  const [items, setItems] = useState<any[]>([])

  const fetchItems = () => {
    const fetcher = type === 'fanworks' ? fanworksAPI.getPending() : marketAPI.getPending()
    fetcher.then((d: any) => setItems(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { fetchItems() }, [])

  const handleApprove = async (id: number) => {
    const fn = type === 'fanworks' ? fanworksAPI.approve : marketAPI.approve
    await fn(id).catch(() => {})
    fetchItems()
  }

  const handleReject = async (id: number) => {
    const fn = type === 'fanworks' ? fanworksAPI.reject : marketAPI.reject
    await fn(id).catch(() => {})
    fetchItems()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">{type === 'fanworks' ? '创作审核' : '集市审核'}</h2>

      {items.length === 0 && <p className="text-sm text-[var(--text-muted)]">暂无待审核内容</p>}

      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg p-4 border border-[var(--border)]">
            <div className="flex gap-3">
              {item.images?.[0] && <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{item.title || item.text?.substring(0, 30) || '无标题'}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">by {item.author_name || '匿名'}</div>
                <div className="text-xs text-[var(--text-light)] mt-1 line-clamp-2">{item.text}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleApprove(item.id)} className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs border-none cursor-pointer hover:bg-green-600">通过</button>
              <button onClick={() => handleReject(item.id)} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs border-none cursor-pointer hover:bg-red-600">拒绝</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
