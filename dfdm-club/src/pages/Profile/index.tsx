import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authAPI } from '@/services/auth'
import { uploadAPI } from '@/services/upload'
import { fanworksAPI } from '@/services/fanworks'
import { marketAPI } from '@/services/market'
import { guestbookAPI } from '@/services/guestbook'
import { getAvatarGradient, titleBadgeClass, formatDate } from '@/utils/format'
import AvatarCropper from './AvatarCropper'
import SecurityCenter from './SecurityCenter'

interface ProfileUser {
  id: number
  username: string
  role: string
  title: string | null
  avatar: string | null
  created_at: string
}

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser, updateProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [tab, setTab] = useState<'fanworks' | 'market' | 'guestbook'>('fanworks')
  const [items, setItems] = useState<any[]>([])
  const [showEdit, setShowEdit] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)

  const profileId = id ? parseInt(id) : currentUser?.id
  const isOwn = currentUser && profileId === currentUser.id

  useEffect(() => {
    if (!profileId) return
    authAPI.getProfile(profileId)
      .then((data: any) => setProfile(data.user || data))
      .catch(() => {})
  }, [profileId])

  const fetchTabItems = useCallback(async () => {
    if (!profileId) return
    try {
      let data: any
      if (tab === 'fanworks') data = await fanworksAPI.getWorks()
      else if (tab === 'market') data = await marketAPI.getItems()
      else data = await guestbookAPI.getMessages()
      const all = Array.isArray(data) ? data : []
      setItems(all.filter((i: any) => i.author_id === profileId))
    } catch {}
  }, [profileId, tab])

  useEffect(() => { fetchTabItems() }, [fetchTabItems])

  const handleDelete = async (type: string, itemId: number) => {
    if (!confirm('确定删除？')) return
    try {
      if (type === 'fanworks') await fanworksAPI.deleteWork(itemId)
      else if (type === 'market') await marketAPI.deleteItem(itemId)
      else await guestbookAPI.deleteMessage(itemId)
      fetchTabItems()
    } catch {}
  }

  if (!profile) {
    return <div className="max-w-[var(--max-width)] mx-auto px-4 py-12 text-center text-[var(--text-muted)]">加载中...</div>
  }

  const badge = titleBadgeClass(profile.title || (profile.role === 'admin' ? '管理员' : null))

  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">首页</Link>
        <span className="mx-1">/</span>
        <span>个人中心</span>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[var(--border)] text-center max-w-md mx-auto mb-6">
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold" style={{ background: getAvatarGradient(profile.id) }}>
            {profile.username.charAt(0)}
          </div>
        )}
        <h2 className="text-lg font-bold">{profile.username}</h2>
        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
        <p className="text-xs text-[var(--text-muted)] mt-1">入社时间：{formatDate(profile.created_at)}</p>

        {isOwn && (
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => setShowEdit(true)} className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs border-none cursor-pointer hover:bg-[var(--accent-hover)]">编辑资料</button>
            <button onClick={() => setShowSecurity(true)} className="px-4 py-1.5 bg-white text-[var(--accent)] rounded-lg text-xs border border-[var(--accent)] cursor-pointer hover:bg-[var(--accent-light)]">安全中心</button>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(['fanworks', 'market', 'guestbook'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-none bg-transparent cursor-pointer transition-colors ${tab === t ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`}
          >
            {t === 'fanworks' ? '创作' : t === 'market' ? '集市' : '帖子'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg p-3 border border-[var(--border)] flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{item.title || item.text?.substring(0, 30) || '无标题'}</h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(item.created_at)}</p>
            </div>
            {isOwn && (
              <button onClick={() => handleDelete(tab, item.id)} className="shrink-0 px-2 py-1 text-xs text-red-500 bg-transparent border border-red-200 rounded cursor-pointer hover:bg-red-50">删除</button>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-6">暂无内容</p>}
      </div>

      {showEdit && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} onUpdate={(data) => { setProfile(p => p ? { ...p, ...data } : p); updateProfile(data); }} />}
      {showSecurity && <SecurityCenter onClose={() => setShowSecurity(false)} />}
    </div>
  )
}

function EditProfileModal({ profile, onClose, onUpdate }: { profile: ProfileUser; onClose: () => void; onUpdate: (data: any) => void }) {
  const [username, setUsername] = useState(profile.username)
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [showCrop, setShowCrop] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleCrop = async (dataUrl: string) => {
    setShowCrop(false)
    setUploading(true)
    try {
      const res: any = await uploadAPI.uploadImages([dataUrl])
      const url = res.urls?.[0]
      if (url) setAvatar(url)
    } catch {
      alert('头像上传失败')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await authAPI.updateProfile({ username: username.trim(), avatar })
      onUpdate({ username: username.trim(), avatar })
      onClose()
    } catch {}
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--text-muted)] bg-transparent border-none cursor-pointer text-xl">×</button>
        <h3 className="text-base font-bold mb-4">编辑资料</h3>
        <div className="space-y-3">
          <div className="text-center">
            {uploading ? (
              <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gray-100 flex items-center justify-center text-xs text-[var(--text-muted)]">上传中...</div>
            ) : avatar ? (
              <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gray-100 flex items-center justify-center text-xl">👤</div>
            )}
            <button onClick={() => setShowCrop(true)} disabled={uploading} className="text-xs text-[var(--accent)] bg-transparent border-none cursor-pointer disabled:opacity-50">更换头像</button>
          </div>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="用户名" className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
          <button onClick={handleSave} disabled={loading || uploading} className="w-full py-2 bg-[var(--accent)] text-white rounded-lg text-sm border-none cursor-pointer hover:bg-[var(--accent-hover)] disabled:opacity-60">
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
        {showCrop && <AvatarCropper onCrop={handleCrop} onClose={() => setShowCrop(false)} />}
      </div>
    </div>
  )
}
