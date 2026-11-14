import { useState, useEffect } from 'react'
import { monthlyAPI } from '@/services/monthly'
import { fanworksAPI } from '@/services/fanworks'
import { marketAPI } from '@/services/market'
import { activitiesAPI } from '@/services/activities'
import { adminAPI } from '@/services/admin'
import MonthlyPublish from './MonthlyPublish'
import ReviewQueue from './ReviewQueue'
import ActivityManage from './ActivityManage'
import AnnouncementManage from './AnnouncementManage'
import UserManage from './UserManage'
import StatsManage from './StatsManage'

const CARDS = [
  { key: 'monthly', title: '月刊发布', icon: '📖', color: '#e3f2fd' },
  { key: 'review', title: '创作审核', icon: '✅', color: '#e8f5e9' },
  { key: 'marketReview', title: '集市审核', icon: '🛒', color: '#fff3e0' },
  { key: 'activities', title: '活动管理', icon: '🎯', color: '#fce4ec' },
  { key: 'announcements', title: '公告管理', icon: '📢', color: '#f3e5f5' },
  { key: 'users', title: '成员列表', icon: '👥', color: '#e0f7fa' },
  { key: 'stats', title: '据点数据', icon: '📊', color: '#fff9c4' },
]

export default function Admin() {
  const [panel, setPanel] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    Promise.all([
      monthlyAPI.getIssues().catch(() => []),
      fanworksAPI.getPending().catch(() => []),
      marketAPI.getPending().catch(() => []),
      activitiesAPI.getActivities().catch(() => []),
      fetch('/api/announcements').then(r => r.json()).catch(() => []),
    ]).then(([monthly, fanworks, market, activities, announcements]) => {
      setCounts({
        monthly: Array.isArray(monthly) ? monthly.length : 0,
        review: Array.isArray(fanworks) ? fanworks.length : 0,
        marketReview: Array.isArray(market) ? market.length : 0,
        activities: Array.isArray(activities) ? activities.length : 0,
        announcements: Array.isArray(announcements) ? announcements.length : 0,
      })
    })
  }, [])

  const panels: Record<string, React.ReactNode> = {
    monthly: <MonthlyPublish onBack={() => setPanel(null)} />,
    review: <ReviewQueue type="fanworks" onBack={() => setPanel(null)} />,
    marketReview: <ReviewQueue type="market" onBack={() => setPanel(null)} />,
    activities: <ActivityManage onBack={() => setPanel(null)} />,
    announcements: <AnnouncementManage onBack={() => setPanel(null)} />,
    users: <UserManage onBack={() => setPanel(null)} />,
    stats: <StatsManage onBack={() => setPanel(null)} />,
  }

  if (panel && panels[panel]) {
    return <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">{panels[panel]}</div>
  }

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">管理后台</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CARDS.map(card => (
          <div
            key={card.key}
            onClick={() => setPanel(card.key)}
            className="bg-white rounded-xl p-5 border border-[var(--border)] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 text-center relative"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-3xl mb-2" style={{ background: card.color }}>{card.icon}</div>
            <div className="font-semibold text-sm">{card.title}</div>
            {counts[card.key] > 0 && (
              <span className="absolute top-2 right-2 min-w-[20px] h-5 bg-[var(--accent)] text-white text-[10px] rounded-full flex items-center justify-center px-1">
                {counts[card.key]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
