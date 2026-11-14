import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { marketAPI } from '@/services/market'
import { fanworksAPI } from '@/services/fanworks'
import { guestbookAPI } from '@/services/guestbook'

function highlight(text: string, query: string) {
  if (!query || !text) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? `<mark class="bg-yellow-200 rounded px-0.5">${part}</mark>`
      : part
  ).join('')
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<{ market: any[]; fanworks: any[]; guestbook: any[] }>({ market: [], fanworks: [], guestbook: [] })

  useEffect(() => {
    if (!query) return
    const q = query.toLowerCase()
    Promise.all([
      marketAPI.getItems().catch(() => []),
      fanworksAPI.getWorks().catch(() => []),
      guestbookAPI.getMessages().catch(() => []),
    ]).then(([market, fanworks, guestbook]) => {
      const m = (Array.isArray(market) ? market : []).filter((i: any) =>
        (i.title || '').toLowerCase().includes(q) || (i.ip || '').toLowerCase().includes(q)
      )
      const f = (Array.isArray(fanworks) ? fanworks : []).filter((w: any) =>
        (w.text || '').toLowerCase().includes(q) || (w.tag1 || '').toLowerCase().includes(q) || (w.tag2 || '').toLowerCase().includes(q)
      )
      const g = (Array.isArray(guestbook) ? guestbook : []).filter((msg: any) =>
        (msg.title || '').toLowerCase().includes(q) || (msg.text || '').toLowerCase().includes(q)
      )
      setResults({ market: m, fanworks: f, guestbook: g })
    })
  }, [query])

  const total = results.market.length + results.fanworks.length + results.guestbook.length

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>搜索：{query}</span>
      </div>

      <h1 className="text-lg font-bold mb-4">搜索结果 ({total})</h1>

      {!query && <p className="text-sm text-[var(--text-muted)]">请输入搜索关键词</p>}

      {results.market.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold mb-2">集市 ({results.market.length})</h2>
          <div className="space-y-2">
            {results.market.map((item: any) => (
              <Link key={item.id} to={`/market?id=${item.id}`} className="block bg-white rounded-lg p-3 border border-[var(--border)] no-underline hover:shadow-md transition-shadow">
                <div className="text-sm font-semibold text-[var(--text)]" dangerouslySetInnerHTML={{ __html: highlight(item.title, query) }} />
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.tag} · {item.price}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.fanworks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold mb-2">同人作品 ({results.fanworks.length})</h2>
          <div className="space-y-2">
            {results.fanworks.map((w: any) => (
              <Link key={w.id} to={`/fanworks?id=${w.id}`} className="block bg-white rounded-lg p-3 border border-[var(--border)] no-underline hover:shadow-md transition-shadow">
                <div className="text-xs text-[var(--text-light)]" dangerouslySetInnerHTML={{ __html: highlight((w.text || '').substring(0, 100), query) }} />
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{w.tag1} · {w.tag2} · by {w.author_name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.guestbook.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold mb-2">留言板 ({results.guestbook.length})</h2>
          <div className="space-y-2">
            {results.guestbook.map((msg: any) => (
              <Link key={msg.id} to={`/guestbook?thread=${msg.id}`} className="block bg-white rounded-lg p-3 border border-[var(--border)] no-underline hover:shadow-md transition-shadow">
                <div className="text-sm font-semibold text-[var(--text)]" dangerouslySetInnerHTML={{ __html: highlight(msg.title || '无标题', query) }} />
                <div className="text-xs text-[var(--text-light)] mt-0.5" dangerouslySetInnerHTML={{ __html: highlight((msg.text || '').substring(0, 60), query) }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && total === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-[var(--text-muted)]">没有找到相关内容</p>
        </div>
      )}
    </div>
  )
}
