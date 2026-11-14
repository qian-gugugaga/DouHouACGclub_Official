import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI } from '@/services/user'
import { getAvatarGradient, titleBadgeClass, formatDate } from '@/utils/format'

interface Member {
  id: number
  username: string
  role: string
  title: string | null
  avatar: string | null
  created_at: string
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    userAPI.getUsers()
      .then((data: any) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const adminCount = members.filter(m => m.role === 'admin').length

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>成员展示</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-[var(--accent)]">{members.length}</div>
          <div className="text-xs text-[var(--text-muted)]">总成员</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-[var(--accent)]">{adminCount}</div>
          <div className="text-xs text-[var(--text-muted)]">管理员</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map((m) => {
          const badge = titleBadgeClass(m.title || (m.role === 'admin' ? '管理员' : null))
          return (
            <Link
              key={m.id}
              to={`/profile/${m.id}`}
              className="bg-white rounded-xl p-4 border border-[var(--border)] text-center no-underline hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              {m.avatar ? (
                <img src={m.avatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
              ) : (
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: getAvatarGradient(m.id) }}
                >
                  {m.username.charAt(0)}
                </div>
              )}
              <div className="font-semibold text-sm text-[var(--text)] truncate">{m.username}</div>
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
              <div className="text-[10px] text-[var(--text-muted)] mt-1">{formatDate(m.created_at)}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
