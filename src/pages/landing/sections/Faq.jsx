import { useState } from 'react'

// Вопросы «с улицы» — про саму платформу, до регистрации.
// Внутренние how-to («как отметить оплату» и т.п.) — в отдельной справке, не здесь.
const ITEMS = [
  { q: 'Что такое LinguaFlow?', a: 'Рабочее место преподавателя языков. Группы, расписание, уроки, домашние задания, посещаемость и финансы — в одном месте, вместо десятка вкладок, чатов и таблиц. Вы всегда видите, кто сколько должен, что задано и кто сдал, кто был на занятии. При желании ученик получает личный кабинет с расписанием, оценками, материалами и прогрессом.' },
  { q: 'Сколько это стоит?', a: 'Базовый тариф — бесплатный, его достаточно, чтобы вести первых учеников. Для работы без ограничений есть тариф Pro. Подключение оплаты подписки — в ближайших планах; сейчас ограничения не блокируют работу.' },
  { q: 'Можно ли вести соло, без регистрации учеников?', a: 'Да. Добавляете ученика «заглушкой» — только имя и контакт, без его участия. Ведёте расписание и посещаемость, долг считается автоматически. Когда потребуется, историю можно перенести на личный аккаунт ученика без потери данных.' },
  { q: 'Где это работает и нужно ли что-то устанавливать?', a: 'В любом браузере — на компьютере, планшете и телефоне. Устанавливать ничего не нужно. При желании приложение добавляется на главный экран телефона (PWA).' },
  { q: 'Нужны ли технические знания или свой сайт?', a: 'Нет. Регистрация и работа не требуют настройки, программирования или собственного сайта. Интерфейс понятен с первого входа.' },
  { q: 'Данные преподавателя и учеников в безопасности?', a: 'Да. Каждый преподаватель видит только своё — свои группы, своих учеников и свои финансы. Данные изолированы, доступ к чужой информации исключён.' },
  { q: 'Как быстро можно начать?', a: 'За несколько минут. Регистрация занимает около минуты; далее вы создаёте группу или добавляете ученика — и сразу ведёте занятия.' },
]

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-[#0A0A0B] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="mono-label mb-3">// частые вопросы</p>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight mb-3">Коротко о платформе</h2>
        <p className="text-[#8A8A8F] mb-10">Ответы на вопросы, которые возникают до регистрации.</p>

        <div className="divide-y divide-[#1E1E22] border-y border-[#1E1E22]">
          {ITEMS.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group"
                >
                  <span className="flex gap-3">
                    <span className="font-mono text-[12px] text-[#3A3A40] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-[#EDEDED] group-hover:text-white">{it.q}</span>
                  </span>
                  <span className={`font-mono text-[#5A5A60] shrink-0 transition-transform ${isOpen ? 'rotate-45 text-brand-400' : ''}`}>+</span>
                </button>
                {isOpen && <p className="pb-5 pl-8 -mt-1 text-sm text-[#9A9AA1] leading-relaxed">{it.a}</p>}
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-xl border border-[#1E1E22] bg-[#0D0D0F] p-5 flex items-center gap-3">
          <span className="font-mono text-brand-400">?</span>
          <p className="text-sm text-[#8A8A8F]">Остались вопросы? Зарегистрируйтесь и попробуйте — это бесплатно и занимает пару минут.</p>
        </div>
      </div>
    </section>
  )
}
