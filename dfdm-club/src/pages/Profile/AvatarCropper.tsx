import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  onCrop: (dataUrl: string) => void
  onClose: () => void
}

export default function AvatarCropper({ onCrop, onClose }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [imgW, setImgW] = useState(0)
  const [imgH, setImgH] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [fitScale, setFitScale] = useState(1)
  const [cropping, setCropping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastDist = useRef(0)

  const CIRCLE_RATIO = 0.65

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const img = new Image()
      img.onload = () => {
        setImgW(img.naturalWidth)
        setImgH(img.naturalHeight)
        setImage(url)
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  useEffect(() => {
    if (!image || !imgW || !containerRef.current) return
    const cw = containerRef.current.clientWidth
    const fit = Math.max(cw / imgW, cw / imgH)
    setFitScale(fit)
    setScale(fit)
    setPos({ x: 0, y: 0 })
  }, [image, imgW])

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setPos(prev => ({
      x: prev.x + (e.clientX - lastPos.current.x),
      y: prev.y + (e.clientY - lastPos.current.y),
    }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => { dragging.current = false }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => Math.max(fitScale * 0.5, Math.min(fitScale * 4, prev * (e.deltaY > 0 ? 0.9 : 1.1))))
  }

  const getTouchDist = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      lastDist.current = getTouchDist(e.touches)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getTouchDist(e.touches)
      if (lastDist.current > 0) {
        setScale(prev => Math.max(fitScale * 0.5, Math.min(fitScale * 4, prev * (dist / lastDist.current))))
      }
      lastDist.current = dist
    }
  }

  const handleCrop = useCallback(() => {
    if (!containerRef.current || !imgW || !image) return
    setCropping(true)

    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight
    const r = cw * CIRCLE_RATIO / 2
    const outSize = Math.round(r * 2)
    const s = outSize / cw

    const displayW = imgW * (scale / fitScale)
    const displayH = imgH * (scale / fitScale)
    const imgX = cw / 2 + pos.x - displayW / 2
    const imgY = ch / 2 + pos.y - displayH / 2

    const canvas = document.createElement('canvas')
    canvas.width = outSize
    canvas.height = outSize
    const ctx = canvas.getContext('2d')!

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, outSize, outSize)

      ctx.save()
      ctx.beginPath()
      ctx.arc(outSize / 2, outSize / 2, r, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, imgX * s, imgY * s, displayW * s, displayH * s)
      ctx.restore()

      onCrop(canvas.toDataURL('image/jpeg', 0.9))
      setCropping(false)
    }
    img.onerror = () => setCropping(false)
    img.src = image
  }, [image, imgW, imgH, scale, fitScale, pos, onCrop])

  const sliderMin = fitScale * 0.5
  const sliderMax = fitScale * 4

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-xl p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h4 className="text-sm font-bold mb-3">裁剪头像</h4>
        {!image ? (
          <label
            className="block border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
            onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) loadFile(f) }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
          >
            <div className="text-2xl mb-1">+</div>
            <div className="text-xs text-[var(--text-muted)]">选择或拖拽图片到此处</div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        ) : (
          <div>
            <div
              ref={containerRef}
              className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-move touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <img
                src={image}
                alt=""
                className="absolute pointer-events-none"
                style={{
                  width: imgW * fitScale,
                  height: imgH * fitScale,
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: `translate(-50%, -50%) scale(${scale / fitScale})`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  maskImage: `radial-gradient(circle ${CIRCLE_RATIO * 50}% at 50% 50%, transparent 99%, black 100%)`,
                  WebkitMaskImage: `radial-gradient(circle ${CIRCLE_RATIO * 50}% at 50% 50%, transparent 99%, black 100%)`,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                }}
              />
              <div
                className="absolute rounded-full border-2 border-white pointer-events-none"
                style={{
                  width: `${CIRCLE_RATIO * 100}%`,
                  height: `${CIRCLE_RATIO * 100}%`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[var(--text-muted)]">缩放</span>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={(sliderMax - sliderMin) / 200}
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setImage(null); setScale(1); setFitScale(1); setPos({ x: 0, y: 0 }) }} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer">重选</button>
              <button onClick={handleCrop} disabled={cropping} className="flex-1 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">
                {cropping ? '裁剪中...' : '确认裁剪'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
