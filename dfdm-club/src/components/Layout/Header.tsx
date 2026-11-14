import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NotificationBell from '@/components/NotificationBell'
import { NAV_LINKS } from '@/utils/constants'

export default function Header({ onOpenAuth }: { onOpenAuth: (mode: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-[var(--header-height)] backdrop-blur-xl bg-white/80 border-b border-[var(--border)]">
        <div className="max-w-[var(--max-width)] mx-auto h-full px-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline text-[var(--text)]">
            <img src="/assets/logo.jpg" alt="logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-base">东方动漫社</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded-md transition-colors relative no-underline ${
                    isActive
                      ? 'text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-light)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <span className="hidden lg:block text-xs text-[var(--text-muted)] ml-auto shrink-0">
            我从南极来，最喜欢持石
          </span>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {user ? (
              <>
                <Link to={`/profile/${user.id}`} className="text-sm text-[var(--text)] no-underline hover:text-[var(--accent)]">
                  {user.username}
                </Link>
                <NotificationBell />
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-xs px-2 py-1 bg-[var(--accent-light)] text-[var(--accent)] rounded no-underline">
                    管理
                  </Link>
                )}
                <button onClick={handleLogout} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-none cursor-pointer">
                  登出
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onOpenAuth('login')} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer hover:underline">
                  登录
                </button>
                <button onClick={() => onOpenAuth('register')} className="text-sm px-3 py-1 bg-[var(--accent)] text-white rounded-md border-none cursor-pointer hover:bg-[var(--accent-hover)]">
                  注册
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden bg-transparent border-none cursor-pointer p-1 text-[var(--text)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl pt-[var(--header-height)] pb-6 px-6 flex flex-col gap-2 border-b border-[var(--border)]">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base rounded-lg no-underline ${
                    isActive ? 'text-[var(--accent)] bg-[var(--accent-light)] font-semibold' : 'text-[var(--text)] hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
