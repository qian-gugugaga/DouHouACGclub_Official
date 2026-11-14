import { useState, useEffect } from 'react'
import { statsAPI } from '@/services/stats'

export default function StatsManage({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState({ members: 0, works: 0, events: 0, months: 0 })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    statsAPI.getStats().then((d: any) => {
      if (d) setStats({ members: d.members || 0, works: d.works || 0, events: d.events || 0, months: d.months || 0 })
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await statsAPI.updateStats(stats)
      setMsg('已保存')
    } catch { setMsg('保存失败') }
    setLoading(false)
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[var(--accent)] bg-transparent border-none cursor-pointer mb-4">← 返回</button>
      <h2 className="text-lg font-bold mb-4">据点数据</h2>

      {msg && <div className="mb-3 p-2 bg-blue-50 text-blue-700 text-sm rounded-lg text-center">{msg}</div>}

      <div className="space-y-3 max-w-sm">
        {[
          { key: 'members', label: '社团成员' },
          { key: 'works', label: '创作作品' },
          { key: 'events', label: '举办活动' },
          { key: 'months', label: '月刊期数' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs text-[var(--text-muted)] block mb-1">{field.label}</label>
            <input
              type="number"
              value={stats[field.key as keyof typeof stats]}
              onChange={e => setStats(prev => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer disabled:opacity-60">
          {loading ? '...' : '保存'}
        </button>
      </div>
    </div>
  )
}
