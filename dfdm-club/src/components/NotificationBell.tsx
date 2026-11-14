import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const getLink = (n: any) => {
    if (n.type === 'reply' || n.type === 'like') return '/guestbook'
    if (n.type === 'comment' || n.type === 'comment_reply') return '/fanworks'
    if (n.type === 'approve') return '/fanworks'
    return '/'
  }

  const handleClickNotif = async (n: any) => {
    if (!n.read) await markRead(n.id)
    setOpen(false)
    navigate(getLink(n))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative bg-transparent border-none cursor-pointer p-1 text-[var(--text)] hover:text-[var(--accent)]"
        aria-label="通知"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[var(--accent)] text-white text-[10px] rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-sm font-semibold">通知</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[var(--accent)] bg-transparent border-none cursor-pointer">
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">暂无通知</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${n.read ? 'text-[var(--text-muted)]' : 'text-[var(--text)] font-medium'}`}
                >
                  {n.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
