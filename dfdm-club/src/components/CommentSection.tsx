import { useState, useEffect, useCallback } from 'react'
import { commentsAPI } from '@/services/comments'
import { useAuth } from '@/hooks/useAuth'
import { getAvatarGradient, titleBadgeClass, formatDate } from '@/utils/format'

interface Comment {
  id: number
  author_id: number
  author_name: string
  author_title: string | null
  avatar: string | null
  text: string
  parent_id: number | null
  created_at: string
}

interface CommentSectionProps {
  targetType: string
  targetId: number
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const data: any = await commentsAPI.getComments(targetType, targetId)
      setComments(Array.isArray(data) ? data : [])
    } catch {}
  }, [targetType, targetId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    if (!text.trim() || !user) return
    setLoading(true)
    try {
      await commentsAPI.postComment({
        targetType,
        targetId,
        text: text.trim(),
        parentId: replyTo?.id,
      })
      setText('')
      setReplyTo(null)
      fetchComments()
    } catch {}
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-3">评论 ({comments.length})</h4>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
        {comments.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] py-2">暂无评论~</p>
        )}
        {comments.map((c) => {
          const badge = titleBadgeClass(c.author_title)
          const replyComment = c.parent_id ? comments.find(x => x.id === c.parent_id) : null
          return (
            <div
              key={c.id}
              className="flex gap-2 py-2 border-b border-gray-50"
              style={{ marginLeft: c.parent_id ? 36 : 0 }}
            >
              {c.avatar ? (
                <img src={c.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: getAvatarGradient(c.author_id) }}
                >
                  {(c.author_name || '?').charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs">
                  <span className="font-semibold">{c.author_name || '匿名'}</span>
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                  <span className="ml-2 text-[var(--text-muted)] text-[10px]">{formatDate(c.created_at)}</span>
                </div>
                {replyComment && (
                  <div className="text-[11px] text-[var(--accent)] mt-0.5">↳ 回复 @{replyComment.author_name || '匿名'}</div>
                )}
                <div className="text-xs text-[var(--text-light)] mt-0.5 break-words">{c.text}</div>
                <button
                  onClick={() => setReplyTo({ id: c.id, name: c.author_name || '匿名' })}
                  className="text-[11px] text-[var(--accent)] bg-transparent border-none cursor-pointer p-0 mt-1"
                >
                  回复
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {user ? (
        <div>
          {replyTo && (
            <div className="text-xs text-[var(--accent)] mb-1 flex items-center gap-1">
              回复 @{replyTo.name}
              <button onClick={() => setReplyTo(null)} className="text-[var(--text-muted)] bg-transparent border-none cursor-pointer text-xs">×</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? `回复 @${replyTo.name}...` : '写下你的评论...'}
              className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? '...' : '发送'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">登录后可以评论</p>
      )}
    </div>
  )
}
