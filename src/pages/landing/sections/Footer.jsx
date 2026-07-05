// Футер лендинга — тёмный тех-моно.
export default function Footer({ onPrimary }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <footer className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#1E1E22]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-[2px] bg-brand-500" />
              <span className="font-mono text-sm font-semibold">LinguaFlow</span>
            </div>
            <p className="text-sm text-[#6E6E76] max-w-xs">Кокпит преподавателя языков. Группы, ДЗ, посещаемость и финансы — в одном месте.</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[13px] text-[#8A8A8F]">
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer">возможности</button>
            <button onClick={() => scrollTo('how')}      className="hover:text-white transition-colors cursor-pointer">как работает</button>
            <button onClick={() => scrollTo('faq')}       className="hover:text-white transition-colors cursor-pointer">вопросы</button>
            <button onClick={onPrimary}                    className="hover:text-white transition-colors cursor-pointer">начать</button>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[#141416] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[12px] text-[#5A5A60]">
          <span>© {new Date().getFullYear()} LinguaFlow</span>
          <span>сделано для преподавателей языков</span>
        </div>
      </div>
    </footer>
  )
}
