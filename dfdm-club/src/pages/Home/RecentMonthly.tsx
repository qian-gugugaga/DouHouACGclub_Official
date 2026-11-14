import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { monthlyAPI } from '@/services/monthly'
import { formatDate } from '@/utils/format'

interface Issue {
  id: number
  title: string
  publish_date: string
  cover: string | null
  content: string
}

export default function RecentMonthly() {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    monthlyAPI.getIssues()
      .then((data: any) => setIssues(Array.isArray(data) ? data.slice(0, 2) : []))
      .catch(() => {})
  }, [])

  if (issues.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--text)]">最新月刊</h2>
        <Link to="/monthly" className="text-sm text-[var(--accent)] no-underline hover:underline">查看全部 →</Link>
      </div>
      <div className="space-y-3">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            to="/monthly"
            className="flex gap-3 bg-white rounded-lg p-3 border border-[var(--border)] no-underline hover:shadow-md transition-shadow"
          >
            {issue.cover ? (
              <img src={issue.cover} alt="" className="w-20 h-14 object-cover rounded-md shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded-md shrink-0 bg-gradient-to-br from-[#fce4ec] to-[#e8eaf6] flex items-center justify-center text-xl">
                📖
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[var(--text)] truncate">{issue.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(issue.publish_date)}</p>
              <p className="text-xs text-[var(--text-light)] mt-1 line-clamp-1">
                {issue.content?.replace(/\{\{img:\d+\}\}/g, '').substring(0, 60)}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
