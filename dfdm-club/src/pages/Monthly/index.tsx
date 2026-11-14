import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { monthlyAPI } from '@/services/monthly'
import { formatDate } from '@/utils/format'
import MonthlyDetail from './MonthlyDetail'

interface Issue {
  id: number
  title: string
  publish_date: string
  cover: string | null
  content: string
  images: string[]
}

export default function Monthly() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selected, setSelected] = useState<Issue | null>(null)

  useEffect(() => {
    monthlyAPI.getIssues()
      .then((data: any) => setIssues(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>社团月刊</span>
      </div>

      {issues.length > 0 && (
        <div
          onClick={() => setSelected(issues[0])}
          className="bg-white rounded-xl p-4 border-l-4 border-[var(--accent)] cursor-pointer hover:shadow-md transition-shadow mb-4"
        >
          <div className="flex gap-4">
            {issues[0].cover ? (
              <img src={issues[0].cover} alt="" className="w-32 h-24 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-32 h-24 rounded-lg shrink-0 bg-gradient-to-br from-[#fce4ec] to-[#e8eaf6] flex items-center justify-center text-3xl">📖</div>
            )}
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">最新一期</span>
              <h2 className="text-lg font-bold mt-1">{issues[0].title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(issues[0].publish_date)}</p>
              <p className="text-sm text-[var(--text-light)] mt-1 line-clamp-2">
                {issues[0].content?.replace(/\{\{img:\d+\}\}/g, '').substring(0, 80)}...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {issues.slice(1).map((issue) => (
          <div
            key={issue.id}
            onClick={() => setSelected(issue)}
            className="flex gap-3 bg-white rounded-lg p-3 border border-[var(--border)] cursor-pointer hover:shadow-md transition-shadow"
          >
            {issue.cover ? (
              <img src={issue.cover} alt="" className="w-20 h-14 object-cover rounded-md shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded-md shrink-0 bg-gradient-to-br from-[#fce4ec] to-[#e8eaf6] flex items-center justify-center text-xl">📖</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{issue.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(issue.publish_date)}</p>
            </div>
          </div>
        ))}
      </div>

      {issues.length === 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-8">暂无月刊</p>
      )}

      {selected && <MonthlyDetail issue={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
