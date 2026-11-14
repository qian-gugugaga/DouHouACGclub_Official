import { useState, useMemo } from 'react'
import { FORTUNE_YI_POOL, FORTUNE_JI_POOL } from '@/utils/constants'

function pick(arr: string[], n: number): string[] {
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp
  }
  return copy.slice(0, n)
}

export default function FortuneWidget() {
  const today = new Date()
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const storageKey = `fortune_${dateKey}`

  const [fortune, setFortune] = useState<{ yi: string[]; ji: string[] } | null>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : null
  })
  const [shaking, setShaking] = useState(false)

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const weekdayNames = ['周日','周一','周二','周三','周四','周五','周六']

  const getFortune = () => {
    let seed = dateKey.split('-').reduce((s, v) => s + parseInt(v), 0)
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const yi = pick(FORTUNE_YI_POOL, 2 + Math.floor(rng() * 2))
    const ji = pick(FORTUNE_JI_POOL, 1 + Math.floor(rng() * 2))
    return { yi, ji }
  }

  const handleClick = () => {
    if (fortune) return
    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      const f = getFortune()
      setFortune(f)
      localStorage.setItem(storageKey, JSON.stringify(f))
    }, 500)
  }

  return (
    <div
      onClick={handleClick}
      className={`inline-block bg-white/80 backdrop-blur rounded-xl px-4 py-3 shadow-sm cursor-pointer select-none ${shaking ? 'animate-[fortuneShake_0.5s_ease]' : ''} ${fortune ? '' : 'hover:shadow-md'} transition-shadow`}
      title={fortune ? '今日运势已揭晓，明天再来~' : '点击抽签'}
    >
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-[var(--accent)]">{monthNames[today.getMonth()]}</div>
          <div className="text-2xl font-bold">{today.getDate()}</div>
          <div className="text-xs text-[var(--text-muted)]">{weekdayNames[today.getDay()]}</div>
        </div>
        <div className="w-px h-12 bg-[var(--border)]" />
        <div className="flex-1">
          {fortune ? (
            <div className="text-xs animate-[fortunePop_0.3s_ease]">
              <div className="mb-1"><span className="text-green-600 font-medium">宜：</span>{fortune.yi.join('、')}</div>
              <div><span className="text-red-500 font-medium">忌：</span>{fortune.ji.join('、')}</div>
            </div>
          ) : (
            <div className="text-xs text-[var(--text-muted)]">
              <div className="font-medium text-[var(--accent)]">今日运势</div>
              <div>点击抽签~</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
