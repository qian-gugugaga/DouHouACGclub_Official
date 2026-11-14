import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { statsAPI } from '@/services/stats'

interface Announcement {
  id: number
  content: string
  created_at: string
}

interface Stats {
  members: number
  works: number
  events: number
  months: number
}

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    if (animated.current || target <= 0) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          let current = 0
          const step = Math.ceil(target / 60)
          const timer = setInterval(() => {
            current += step
            if (current >= target) {
              setValue(target)
              clearInterval(timer)
            } else {
              setValue(current)
            }
          }, 30)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{value.toLocaleString()}</span>
}

export default function Sidebar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then((data: any) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {})
    statsAPI.getStats()
      .then((data: any) => setStats(data))
      .catch(() => {})
  }, [])

  const tags = ['动漫', '游戏', '漫画', 'COS', '手办', '同人', '轻小说', '声优', '音乐', '展会']

  return (
    <aside className="space-y-4">
      {/* Announcements */}
      <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <span className="text-[var(--accent)]">📢</span> 社团公告
        </h3>
        {announcements.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">暂无公告~</p>
        ) : (
          <ul className="space-y-2">
            {announcements.map((a) => (
              <li key={a.id} className="text-xs text-[var(--text-light)] border-b border-gray-50 pb-2 last:border-0">
                {a.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <span className="text-[var(--accent)]">📊</span> 据点数据
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '社团成员', value: stats?.members || 0, icon: '👥' },
            { label: '创作作品', value: stats?.works || 0, icon: '🎨' },
            { label: '举办活动', value: stats?.events || 0, icon: '🎯' },
            { label: '月刊期数', value: stats?.months || 0, icon: '📖' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-lg">{item.icon}</div>
              <div className="text-lg font-bold text-[var(--accent)]">
                <AnimatedNumber target={item.value} />
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <span className="text-[var(--accent)]">🏷️</span> 热门标签
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(tag)}`}
              className="text-[11px] px-2 py-1 bg-[var(--accent-light)] text-[var(--accent)] rounded-full no-underline hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
