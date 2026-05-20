import { useState } from 'react'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Features from './sections/Features'
import About from './sections/About'
import Faq from './sections/Faq'
import Footer from './sections/Footer'
import AuthModal from '../../components/auth/AuthModal'

export default function LandingPage() {
  const [auth, setAuth] = useState({ open: false, tab: 'login' })

  const openLogin    = () => setAuth({ open: true, tab: 'login' })
  const openRegister = () => setAuth({ open: true, tab: 'register' })
  const close        = () => setAuth({ ...auth, open: false })

  return (
    <div className="relative overflow-x-hidden">
      <Header onLogin={openLogin} onRegister={openRegister} />
      <main>
        <Hero    onPrimary={openRegister} onSecondary={openLogin} />
        <Features />
        <About   onPrimary={openRegister} />
        <Faq />
        <Footer  onPrimary={openRegister} />
      </main>

      <AuthModal open={auth.open} onClose={close} initialTab={auth.tab} />
    </div>
  )
}
