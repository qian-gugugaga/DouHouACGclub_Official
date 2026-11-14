import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { guestbookAPI } from '@/services/guestbook'
import { useAuth } from '@/hooks/useAuth'
import { useOutletContext } from 'react-router-dom'
import { formatDate, getAvatarGradient, titleBadgeClass } from '@/utils/format'
import ThreadDetail from './ThreadDetail'
import NewThreadForm from './NewThreadForm'

interface Message {
  id: number
  title: string | null
  text: string
  images: string[] | null
  author_name: string
  author_id: number
  author_title: string | null
  avatar: string | null
  parent_id: number | null
  likes: number
  reply_count: number
  created_at: string
}

export default function Guestbook() {
  const { user } = useAuth()
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: (mode: string) => void }>()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)
  const [showNewThread, setShowNewThread] = useState(false)

  const fetchMessages = () => {
    guestbookAPI.getMessages()
      .then((data: any) => {
        const all: Message[] = Array.isArray(data) ? data : []
        setMessages(all.filter(m => !m.parent_id))
      })
      .catch(() => {})
  }

  useEffect(() => { fetchMessages() }, [])

  useEffect(() => {
    const threadId = searchParams.get('thread')
    if (threadId && messages.length > 0) {
      const msg = messages.find(m => m.id === parseInt(threadId))
      if (msg) setSelected(msg)
    }
  }, [searchParams, messages])

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>社员论坛</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">留言板</h1>
        <button
          onClick={() => {
            if (!user) { onOpenAuth('login'); return }
            setShowNewThread(true)
          }}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer hover:bg-[var(--accent-hover)]"
        >
          + 发帖
        </button>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const badge = titleBadgeClass(msg.author_title)
          return (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className="bg-white rounded-lg p-4 border border-[var(--border)] cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {msg.avatar ? (
                  <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ background: getAvatarGradient(msg.author_id) }}>
                    {(msg.author_name || '?').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--text)] truncate">{msg.title || '无标题'}</h3>
                  <p className="text-xs text-[var(--text-light)] mt-0.5 line-clamp-2">{msg.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
                    <span>{msg.author_name || '匿名'}</span>
                    <span className={`px-1 py-0 rounded ${badge.className}`}>{badge.label}</span>
                    <span>{formatDate(msg.created_at)}</span>
                    <span className="ml-auto">💬 {msg.reply_count || 0}</span>
                    <span>♥ {msg.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">暂无帖子</p>
        )}
      </div>

      {selected && <ThreadDetail thread={selected} onClose={() => { setSelected(null); fetchMessages() }} />}
      {showNewThread && <NewThreadForm onClose={() => { setShowNewThread(false); fetchMessages() }} />}
    </div>
  )
}
