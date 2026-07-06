import { useNavigate } from 'react-router-dom'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Pain from './sections/Pain'
import Features from './sections/Features'
import Modes from './sections/Modes'
import StudentView from './sections/StudentView'
import ForWhom from './sections/ForWhom'
import ForStudents from './sections/ForStudents'
import Faq from './sections/Faq'
import Footer from './sections/Footer'

export default function LandingPage() {
  const navigate = useNavigate()
  const toLogin           = () => navigate('/login')
  const toRegister        = () => navigate('/register')          // учитель (лендинг teacher-first)
  const toStudentLanding  = () => navigate('/for-students')      // лендинг ученика

  return (
    <div className="relative overflow-x-hidden bg-[#0A0A0B]">
      <Header onLogin={toLogin} onRegister={toRegister} />
      <main>
        <Hero        onPrimary={toRegister} onSecondary={toLogin} />
        <Pain />
        <Features />
        <Modes       onPrimary={toRegister} />
        <StudentView />
        <ForWhom />
        <ForStudents onStudentLanding={toStudentLanding} onLogin={toLogin} />
        <Faq />
      </main>
      <Footer onPrimary={toRegister} />
    </div>
  )
}
