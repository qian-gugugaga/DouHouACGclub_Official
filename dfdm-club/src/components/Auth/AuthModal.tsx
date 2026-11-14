import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  open: boolean
  mode: string
  onClose: () => void
  onSwitchMode: (mode: string) => void
}

export default function AuthModal({ open, mode, onClose, onSwitchMode }: AuthModalProps) {
  const { login, register, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string

    try {
      if (mode === 'login') {
        await login(username, password)
        onClose()
      } else if (mode === 'register') {
        const confirmPassword = form.get('confirmPassword') as string
        const qq = form.get('qq') as string
        const phone = form.get('phone') as string
        await register({ username, password, confirmPassword, qq, phone })
        setSuccess('注册成功，请登录')
        onSwitchMode('login')
      } else if (mode === 'resetPassword') {
        const phone = form.get('phone') as string
        const qq = form.get('qq') as string
        const newPassword = form.get('newPassword') as string
        await resetPassword({ username, phone, qq, newPassword })
        setSuccess('密码已重置，请登录')
        onSwitchMode('login')
      }
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<string, string> = {
    login: '登录',
    register: '注册',
    resetPassword: '找回密码',
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer text-xl leading-none"
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-center mb-5">{titles[mode]}</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-50 text-green-600 text-sm rounded-lg text-center">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="username" placeholder="用户名" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />

          {mode !== 'resetPassword' && (
            <input name="password" type="password" placeholder="密码" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          )}

          {mode === 'register' && (
            <>
              <input name="confirmPassword" type="password" placeholder="确认密码" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
              <input name="qq" placeholder="QQ号" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
              <input name="phone" placeholder="手机号" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
            </>
          )}

          {mode === 'resetPassword' && (
            <>
              <input name="phone" placeholder="手机号" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
              <input name="qq" placeholder="QQ号" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
              <input name="newPassword" type="password" placeholder="新密码" required className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors"
          >
            {loading ? '处理中...' : titles[mode]}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[var(--text-muted)] space-y-1">
          {mode === 'login' && (
            <>
              <span className="cursor-pointer hover:text-[var(--accent)]" onClick={() => onSwitchMode('register')}>没有账号？注册</span>
              <br />
              <span className="cursor-pointer hover:text-[var(--accent)]" onClick={() => onSwitchMode('resetPassword')}>忘记密码？</span>
            </>
          )}
          {mode === 'register' && (
            <span className="cursor-pointer hover:text-[var(--accent)]" onClick={() => onSwitchMode('login')}>已有账号？登录</span>
          )}
          {mode === 'resetPassword' && (
            <span className="cursor-pointer hover:text-[var(--accent)]" onClick={() => onSwitchMode('login')}>返回登录</span>
          )}
        </div>
      </div>
    </div>
  )
}
