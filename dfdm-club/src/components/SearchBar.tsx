import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
        className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-l-lg focus:outline-none focus:border-[var(--accent)] w-32 focus:w-48 transition-all"
      />
      <button
        type="submit"
        className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-r-lg border-none cursor-pointer text-sm hover:bg-[var(--accent-hover)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  )
}
