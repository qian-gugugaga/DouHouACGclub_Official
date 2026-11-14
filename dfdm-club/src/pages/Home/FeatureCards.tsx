import { Link } from 'react-router-dom'
import { CalendarOutlined, ShopOutlined, ReadOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'

const cards = [
  { path: '/activities', title: '活动合集', desc: '线上线下精彩活动', color: '#fce4ec', icon: <CalendarOutlined />, iconColor: '#e75a7c' },
  { path: '/market', title: '动漫集市', desc: '二手周边交换平台', color: '#e8f5e9', icon: <ShopOutlined />, iconColor: '#4caf50' },
  { path: '/monthly', title: '社团月刊', desc: '每月精选内容', color: '#e3f2fd', icon: <ReadOutlined />, iconColor: '#2196f3' },
  { path: '/fanworks', title: '创作广场', desc: '同人创作投稿展示', color: '#fff3e0', icon: <EditOutlined />, iconColor: '#ff9800' },
  { path: '/guestbook', title: '留言板', desc: '社员交流论坛', color: '#f3e5f5', icon: <MessageOutlined />, iconColor: '#9c27b0' },
]

export default function FeatureCards() {
  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 -mt-6 relative z-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="bg-white rounded-xl p-4 text-center no-underline hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border border-[var(--border)]"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl"
              style={{ background: card.color, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div className="font-semibold text-sm text-[var(--text)] mb-0.5">{card.title}</div>
            <div className="text-xs text-[var(--text-muted)]">{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
