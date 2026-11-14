import { useState, useEffect, useCallback } from 'react'
import { guestbookAPI } from '@/services/guestbook'
import { uploadAPI } from '@/services/upload'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, getAvatarGradient, titleBadgeClass } from '@/utils/format'
import LikeButton from '@/components/LikeButton'

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
  created_at: string
}

interface Props {
  thread: Message
  onClose: () => void
}

function ReplyItem({ reply, allReplies, depth }: { reply: Message; allReplies: Message[]; depth: number }) {
  const badge = titleBadgeClass(reply.author_title)
  const children = depth < 3 ? allReplies.filter(r => r.parent_id === reply.id) : []

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className="flex gap-2 py-2 border-b border-gray-50">
        {reply.avatar ? (
          <img src={reply.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: getAvatarGradient(reply.author_id) }}>
            {(reply.author_name || '?').charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs">
            <span className="font-semibold">{reply.author_name || '匿名'}</span>
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
            <span className="ml-2 text-[var(--text-muted)] text-[10px]">{formatDate(reply.created_at)}</span>
          </div>
          <div className="text-xs text-[var(--text-light)] mt-0.5 break-words">{reply.text}</div>
          {reply.images?.[0] && (
            <img src={reply.images[0]} alt="" className="mt-1 max-w-[200px] rounded-lg" />
          )}
        </div>
      </div>
      {children.map(child => (
        <ReplyItem key={child.id} reply={child} allReplies={allReplies} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function ThreadDetail({ thread, onClose }: Props) {
  const { user } = useAuth()
  const [replies, setReplies] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)
  const [replyImage, setReplyImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchThread = useCallback(async () => {
    try {
      const data: any = await guestbookAPI.getMessage(thread.id)
      if (data.replies) setReplies(data.replies)
    } catch {}
  }, [thread.id])

  useEffect(() => {
    fetchThread()
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [fetchThread, onClose])

  const handleReplyImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setReplyImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      let images: string[] = []
      if (replyImage) {
        const uploadRes: any = await uploadAPI.uploadImages([replyImage])
        images = uploadRes.urls || []
      }
      await guestbookAPI.postMessage({
        text: text.trim(),
        parentId: replyTo?.id || thread.id,
        images,
      })
      setText('')
      setReplyTo(null)
      setReplyImage(null)
      fetchThread()
    } catch {}
    setLoading(false)
  }

  const handleLike = async () => {
    const res: any = await guestbookAPI.toggleLike(thread.id)
    return { liked: res.liked, likes: res.likes }
  }

  const badge = titleBadgeClass(thread.author_title)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border-none cursor-pointer text-lg text-[var(--text-muted)]">×</button>

        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            {thread.avatar ? (
              <img src={thread.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: getAvatarGradient(thread.author_id) }}>
                {(thread.author_name || '?').charAt(0)}
              </div>
            )}
            <div>
              <span className="text-sm font-semibold">{thread.author_name || '匿名'}</span>
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
              <div className="text-[10px] text-[var(--text-muted)]">{formatDate(thread.created_at)}</div>
            </div>
          </div>
          {thread.title && <h2 className="text-base font-bold mb-2">{thread.title}</h2>}
          <p className="text-sm text-[var(--text-light)] whitespace-pre-wrap">{thread.text}</p>
          {thread.images && thread.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {thread.images.map((img, i) => (
                <img key={i} src={img} alt="" className="max-w-[200px] rounded-lg cursor-pointer" />
              ))}
            </div>
          )}
          <div className="mt-3">
            <LikeButton count={thread.likes || 0} onToggle={handleLike} />
          </div>
        </div>

        <div className="p-4 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2">回复 ({replies.length})</h4>
          {replies.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">暂无回复~</p>
          ) : (
            replies.filter(r => !r.parent_id || r.parent_id === thread.id).map(r => (
              <ReplyItem key={r.id} reply={r} allReplies={replies} depth={0} />
            ))
          )}
        </div>

        {user && (
          <div className="p-4 border-t border-[var(--border)]">
            {replyTo && (
              <div className="text-xs text-[var(--accent)] mb-1 flex items-center gap-1">
                回复 @{replyTo.name}
                <button onClick={() => setReplyTo(null)} className="text-[var(--text-muted)] bg-transparent border-none cursor-pointer">×</button>
              </div>
            )}
            {replyImage && (
              <div className="mb-2 relative inline-block">
                <img src={replyImage} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <button onClick={() => setReplyImage(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-none cursor-pointer">×</button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="shrink-0 w-8 h-8 border border-[var(--border)] rounded-lg flex items-center justify-center cursor-pointer text-[var(--text-muted)] hover:border-[var(--accent)]">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={handleReplyImage} />
              </label>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
                placeholder={replyTo ? `回复 @${replyTo.name}...` : '写回复...'}
                className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--accent)]"
              />
              <button onClick={handleSubmit} disabled={loading || !text.trim()} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-50">
                {loading ? '...' : '发送'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
