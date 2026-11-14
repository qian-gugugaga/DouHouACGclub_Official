import { useRef } from 'react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 9 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (images.length >= maxImages) return
      const reader = new FileReader()
      reader.onload = () => {
        onChange([...images, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">封面</span>
            )}
          </div>
        ))}
      </div>

      {images.length < maxImages && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
        >
          <div className="text-[var(--text-muted)] text-xs">
            <div className="text-2xl mb-1">+</div>
            点击或拖拽上传图片 ({images.length}/{maxImages})
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
