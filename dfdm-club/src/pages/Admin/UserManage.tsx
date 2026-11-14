import { useState, useEffect } from 'react'
import { userAPI } from '@/services/user'
import { getAvatarGradient, formatDate } from '@/utils/format'

export default function UserManage({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [titleInputs, setTitleInputs] = useState<Record<number, string>>({})

  const fetchUsers = () => {
    userAPI.getUsers().then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = async () => {
    if (!search.trim()) { fetchUsers(); return }
    const data: any = await userAPI.searchUsers(search.trim()).catch(() => [])
    setUsers(Array.isArray(data) ? data : [])
  }

  const handleSetTitle = async (id: number) => {
    const title = titleInputs[id] || ''
    await userAPI.setUserTitle(id, title).catch(() => {})
    fetchUsers()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">成员管理</h2>

      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="搜索用户名" className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
        <button onClick={handleSearch} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer">搜索</button>
        <button onClick={fetchUsers} className="px-3 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer">全部</button>
      </div>

      <div className="space-y-2">
        {users.map((u: any) => (
          <div key={u.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[var(--border)]">
            {u.avatar ? (
              <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ background: getAvatarGradient(u.id) }}>
                {u.username.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{u.username} <span className="text-xs text-[var(--text-muted)]">({u.role})</span></div>
              <div className="text-xs text-[var(--text-muted)]">{formatDate(u.created_at)}</div>
            </div>
            <input
              value={titleInputs[u.id] ?? (u.title || '')}
              onChange={e => setTitleInputs(prev => ({ ...prev, [u.id]: e.target.value }))}
              placeholder="头衔"
              className="w-24 px-2 py-1 border border-[var(--border)] rounded text-xs"
            />
            <button onClick={() => handleSetTitle(u.id)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border-none cursor-pointer">设置</button>
          </div>
        ))}
      </div>
    </div>
  )
}
