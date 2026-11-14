import { useState, useEffect } from 'react'
import ImageCarousel from '@/components/ImageCarousel'
import CommentSection from '@/components/CommentSection'
import LikeButton from '@/components/LikeButton'
import { guestbookAPI } from '@/services/guestbook'
import { titleBadgeClass, getAvatarGradient } from '@/utils/format'

interface Fanwork {
  id: number
  tag1: string
  tag2: string
  cn: string
  images: string[]
  text: string
  author_name: string
  author_id: number
  author_title: string | null
  likes: number
}

interface Props {
  work: Fanwork
  onClose: () => void
}

export default function FanworkDetail({ work, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const badge = titleBadgeClass(work.author_title)

  const handleLike = async () => {
    const res: any = await guestbookAPI.toggleLike(work.id)
    return { liked: res.liked, likes: res.likes }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border-none cursor-pointer text-lg text-[var(--text-muted)] hover:text-[var(--text)]">×</button>

        <ImageCarousel images={work.images || []} />

        <div className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {work.tag1 && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">{work.tag1}</span>}
            {work.tag2 && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{work.tag2}</span>}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: getAvatarGradient(work.author_id) }}
            >
              {(work.author_name || '?').charAt(0)}
            </div>
            <span className="text-sm font-semibold">{work.author_name || work.cn || '匿名'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
          </div>

          <p className="text-sm text-[var(--text-light)] mb-4 whitespace-pre-wrap">{work.text}</p>

          <LikeButton
            count={work.likes || 0}
            onToggle={handleLike}
          />

          <CommentSection targetType="fanwork" targetId={work.id} />
        </div>
      </div>
    </div>
  )
}
