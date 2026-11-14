import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackToTop from '@/components/common/BackToTop'
import AuthModal from '@/components/Auth/AuthModal'

export default function Layout() {
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: string }>({ open: false, mode: 'login' })

  const handleOpenAuth = useCallback((mode: string) => {
    setAuthModal({ open: true, mode })
  }, [])

  const handleCloseAuth = useCallback(() => {
    setAuthModal({ open: false, mode: 'login' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenAuth={handleOpenAuth} />
      <main className="flex-1">
        <Outlet context={{ onOpenAuth: handleOpenAuth }} />
      </main>
      <Footer />
      <BackToTop />
      <AuthModal open={authModal.open} mode={authModal.mode} onClose={handleCloseAuth} onSwitchMode={(m) => setAuthModal({ open: true, mode: m })} />
    </div>
  )
}
