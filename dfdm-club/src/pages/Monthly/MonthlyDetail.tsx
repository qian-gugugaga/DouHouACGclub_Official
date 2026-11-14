import { useEffect } from 'react'
import { formatDate } from '@/utils/format'

interface Issue {
  id: number
  title: string
  publish_date: string
  cover: string | null
  content: string
  images: string[]
}

interface Props {
  issue: Issue
  onClose: () => void
}

function renderContent(content: string, images: string[]): string {
  if (!content) return ''
  let html = content
    .replace(/\{\{img:(\d+)\}\}/g, (_, idx) => {
      const i = parseInt(idx)
      return images[i] ? `<img src="${images[i]}" class="w-full rounded-lg my-3" />` : ''
    })
    .split('\n')
    .map(p => p.trim() ? `<p>${p}</p>` : '')
    .join('')
  return html
}

export default function MonthlyDetail({ issue, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border-none cursor-pointer text-lg text-[var(--text-muted)]">×</button>

        {issue.cover && (
          <img src={issue.cover} alt="" className="w-full h-48 object-cover rounded-t-xl" />
        )}

        <div className="p-6">
          <h1 className="text-xl font-bold mb-1">{issue.title}</h1>
          <p className="text-xs text-[var(--text-muted)] mb-4">{formatDate(issue.publish_date)}</p>
          <div
            className="prose prose-sm max-w-none text-[var(--text-light)] [&_img]:rounded-lg [&_img]:my-3"
            dangerouslySetInnerHTML={{ __html: renderContent(issue.content, issue.images || []) }}
          />
        </div>
      </div>
    </div>
  )
}
