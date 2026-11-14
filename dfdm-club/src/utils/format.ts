import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = dayjs(dateStr)
  const now = dayjs()
  if (now.diff(d, 'day') < 1) return d.fromNow()
  if (now.diff(d, 'year') < 1) return d.format('M月D日 HH:mm')
  return d.format('YYYY年M月D日')
}

export function formatCount(n: number | undefined | null): string {
  if (!n) return '0'
  return n.toLocaleString()
}

export function escapeHTML(str: string): string {
  const div = document.createElement('div')
  div.textContent = str || ''
  return div.innerHTML
}

export function titleBadgeClass(title: string | null | undefined): { className: string; label: string } {
  if (!title) return { className: 'bg-green-100 text-green-700', label: '东方社员' }
  if (title === '社长' || title === 'legend') return { className: 'bg-yellow-100 text-yellow-700', label: title }
  return { className: 'bg-blue-100 text-blue-700', label: title }
}

export const AVATAR_COLORS = [
  ['#fce4ec', '#e8eaf6'],
  ['#e8f5e9', '#fff3e0'],
  ['#e3f2fd', '#f3e5f5'],
  ['#fff3e0', '#fce4ec'],
  ['#f3e5f5', '#e8eaf6'],
  ['#e0f7fa', '#fff9c4'],
]

export function getAvatarGradient(userId: number | undefined): string {
  const colors = AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length]
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
}
