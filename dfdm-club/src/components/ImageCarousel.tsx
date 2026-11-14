import { useState, useRef, useEffect } from 'react'

interface ImageCarouselProps {
  images: string[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef(0)

  if (!images || images.length === 0) return null

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(images.length - 1, i + 1))

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].screenX
    if (Math.abs(delta) > 60) {
      if (delta > 0) next()
      else prev()
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg bg-black/5" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full shrink-0">
            <img src={src} alt={`图片 ${i + 1}`} className="w-full h-auto max-h-[60vh] object-contain" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center border-none cursor-pointer disabled:opacity-30"
          >
            ‹
          </button>
          <button
            onClick={next}
            disabled={idx === images.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center border-none cursor-pointer disabled:opacity-30"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i === idx ? 'bg-[var(--accent)]' : 'bg-white/60'}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
