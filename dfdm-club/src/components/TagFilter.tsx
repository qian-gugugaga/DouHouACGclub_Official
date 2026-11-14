import { useAuth } from '@/hooks/useAuth'

interface TagFilterProps {
  tags: string[]
  activeTag: string
  onSelect: (tag: string) => void
  showMine?: boolean
}

export default function TagFilter({ tags, activeTag, onSelect, showMine = false }: TagFilterProps) {
  const { user } = useAuth()

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-all ${
            activeTag === tag
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-white text-[var(--text-light)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          {tag}
        </button>
      ))}
      {showMine && user && (
        <button
          onClick={() => onSelect('mine')}
          className={`px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-all ${
            activeTag === 'mine'
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-white text-[var(--text-light)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          我的
        </button>
      )}
    </div>
  )
}
