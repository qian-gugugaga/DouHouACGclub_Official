import { useState, useCallback } from 'react'

interface LikeButtonProps {
  liked?: boolean
  count?: number
  onToggle: () => Promise<{ liked: boolean; likes: number }>
}

export default function LikeButton({ liked = false, count = 0, onToggle }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(liked)
  const [likeCount, setLikeCount] = useState(count)
  const [animating, setAnimating] = useState(false)

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    try {
      const result = await onToggle()
      setIsLiked(result.liked)
      setLikeCount(result.likes)
    } catch {}
  }, [onToggle])

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${isLiked ? 'text-[#fb7299]' : 'text-[var(--text-muted)]'}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={animating ? 'animate-[likeBounce_0.4s_ease]' : ''}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-xs">{likeCount}</span>
    </button>
  )
}
