import { useNavigate } from 'react-router-dom'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Pain from './sections/Pain'
import WhyUs from './sections/WhyUs'
import Features from './sections/Features'
import Modes from './sections/Modes'
import StudentView from './sections/StudentView'
import ForWhom from './sections/ForWhom'
import ForStudents from './sections/ForStudents'
import Pricing from './sections/Pricing'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'
import Footer from './sections/Footer'

export default function LandingPage() {
  const navigate = useNavigate()
  const toLogin           = () => navigate('/login')
  const toRegister        = () => navigate('/register')          // учитель (лендинг teacher-first)
  const toStudentLanding  = () => navigate('/for-students')      // лендинг ученика

  return (
    <div className="relative overflow-x-hidden bg-white text-[#0E1726]">
      <Header onLogin={toLogin} onRegister={toRegister} />
      <main>
        <Hero        onPrimary={toRegister} onStudent={toStudentLanding} />
        <Pain />
        <WhyUs />
        <Features    onCta={toRegister} />
        <Modes       onPrimary={toRegister} />
        <StudentView />
        <ForWhom />
        <ForStudents onStudentLanding={toStudentLanding} onLogin={toLogin} />
        <Pricing     onPrimary={toRegister} />
        <Faq />
        <FinalCta    onPrimary={toRegister} />
      </main>
      <Footer onPrimary={toRegister} />
    </div>
  )
}
