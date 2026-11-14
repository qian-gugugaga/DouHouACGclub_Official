import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fanworksAPI } from '@/services/fanworks'
import { useAuth } from '@/hooks/useAuth'
import { useOutletContext } from 'react-router-dom'
import TagFilter from '@/components/TagFilter'
import { titleBadgeClass, getAvatarGradient } from '@/utils/format'
import FanworkDetail from './FanworkDetail'
import SubmitForm from './SubmitForm'
import { FANWORK_TAGS } from '@/utils/constants'

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
  status?: string
}

export default function Fanworks() {
  const { user } = useAuth()
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: (mode: string) => void }>()
  const [searchParams] = useSearchParams()
  const [works, setWorks] = useState<Fanwork[]>([])
  const [filter, setFilter] = useState('全部')
  const [selected, setSelected] = useState<Fanwork | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)

  const fetchWorks = () => {
    const fetcher = filter === 'mine' ? fanworksAPI.getMyWorks() : fanworksAPI.getWorks()
    fetcher
      .then((data: any) => setWorks(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { fetchWorks() }, [filter])

  useEffect(() => {
    const id = searchParams.get('id')
    if (id && works.length > 0) {
      const work = works.find(w => w.id === parseInt(id))
      if (work) setSelected(work)
    }
  }, [searchParams, works])

  const filtered = filter === '全部' || filter === 'mine'
    ? works
    : works.filter(w => w.tag1 === filter || w.tag2 === filter)

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>创作广场</span>
      </div>

      <TagFilter tags={['全部', ...FANWORK_TAGS]} activeTag={filter} onSelect={setFilter} showMine />

      {filter === 'mine' && !user && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)] mb-2">请先登录查看我的作品</p>
          <button onClick={() => onOpenAuth('login')} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer">去登录</button>
        </div>
      )}

      <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
        {filtered.map((w) => {
          const badge = titleBadgeClass(w.author_title)
          return (
            <div
              key={w.id}
              onClick={() => setSelected(w)}
              className="break-inside-avoid mb-4 bg-white rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              {w.images?.[0] && (
                <img src={w.images[0]} alt="" className="w-full h-auto" />
              )}
              <div className="p-3">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {w.tag1 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent)]">{w.tag1}</span>}
                  {w.tag2 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{w.tag2}</span>}
                </div>
                <p className="text-xs text-[var(--text-light)] line-clamp-2 mb-2">{w.text}</p>
                <div className="flex items-center gap-1.5">
                  {w.author_name && (
                    <>
                      <div
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ background: getAvatarGradient(w.author_id) }}
                      >
                        {w.author_name.charAt(0)}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)]">{w.author_name}</span>
                      <span className={`text-[9px] px-1 py-0 rounded ${badge.className}`}>{badge.label}</span>
                    </>
                  )}
                  <span className="ml-auto text-[11px] text-[var(--text-muted)]">♥ {w.likes || 0}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-8">暂无作品</p>
      )}

      <button
        onClick={() => {
          if (!user) { onOpenAuth('login'); return }
          setShowSubmit(true)
        }}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[var(--accent)] text-white rounded-full shadow-lg border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium"
      >
        + 我要投稿
      </button>

      {selected && <FanworkDetail work={selected} onClose={() => setSelected(null)} />}
      {showSubmit && <SubmitForm onClose={() => { setShowSubmit(false); fetchWorks() }} />}
    </div>
  )
}
