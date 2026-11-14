import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authAPI } from '@/services/auth'

interface Props {
  onClose: () => void
}

export default function SecurityCenter({ onClose }: Props) {
  const { user } = useAuth()
  const [section, setSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setMsg(null)
    try {
      const res: any = await authAPI.changePassword({
        qq: form.get('qq') as string,
        phone: form.get('phone') as string,
        newPassword: form.get('newPassword') as string,
      })
      if (res.error) setMsg({ text: res.error, type: 'error' })
      else setMsg({ text: '密码已修改', type: 'success' })
    } catch { setMsg({ text: '操作失败', type: 'error' }) }
    setLoading(false)
  }

  const handleChangeQQ = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setMsg(null)
    try {
      const res: any = await authAPI.changeQQ({
        oldQQ: form.get('oldQQ') as string,
        newQQ: form.get('newQQ') as string,
      })
      if (res.error) setMsg({ text: res.error, type: 'error' })
      else setMsg({ text: 'QQ已更新', type: 'success' })
    } catch { setMsg({ text: '操作失败', type: 'error' }) }
    setLoading(false)
  }

  const handleChangePhone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setMsg(null)
    try {
      const res: any = await authAPI.changePhone({
        oldPhone: form.get('oldPhone') as string,
        newPhone: form.get('newPhone') as string,
      })
      if (res.error) setMsg({ text: res.error, type: 'error' })
      else setMsg({ text: '手机号已更新', type: 'success' })
    } catch { setMsg({ text: '操作失败', type: 'error' }) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--text-muted)] bg-transparent border-none cursor-pointer text-xl">×</button>
        <h3 className="text-base font-bold mb-4">安全中心</h3>

        {msg && (
          <div className={`mb-3 p-2 text-sm rounded-lg text-center ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
        )}

        <div className="space-y-2">
          <button onClick={() => setSection(section === 'password' ? null : 'password')} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm border-none cursor-pointer hover:bg-gray-100">
            修改密码 {section === 'password' ? '▲' : '▼'}
          </button>
          {section === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-2 px-2 pb-2">
              <input name="qq" placeholder="验证QQ号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <input name="phone" placeholder="验证手机号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <input name="newPassword" type="password" placeholder="新密码" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <button type="submit" disabled={loading} className="w-full py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">{loading ? '...' : '确认修改'}</button>
            </form>
          )}

          <button onClick={() => setSection(section === 'qq' ? null : 'qq')} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm border-none cursor-pointer hover:bg-gray-100">
            修改QQ {section === 'qq' ? '▲' : '▼'}
          </button>
          {section === 'qq' && (
            <form onSubmit={handleChangeQQ} className="space-y-2 px-2 pb-2">
              <input name="oldQQ" placeholder="原QQ号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <input name="newQQ" placeholder="新QQ号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <button type="submit" disabled={loading} className="w-full py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">{loading ? '...' : '确认修改'}</button>
            </form>
          )}

          <button onClick={() => setSection(section === 'phone' ? null : 'phone')} className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm border-none cursor-pointer hover:bg-gray-100">
            修改手机号 {section === 'phone' ? '▲' : '▼'}
          </button>
          {section === 'phone' && (
            <form onSubmit={handleChangePhone} className="space-y-2 px-2 pb-2">
              <input name="oldPhone" placeholder="原手机号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <input name="newPhone" placeholder="新手机号" required className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm" />
              <button type="submit" disabled={loading} className="w-full py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">{loading ? '...' : '确认修改'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
