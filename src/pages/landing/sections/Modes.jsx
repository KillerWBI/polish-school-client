// «Соло или с учениками» — два режима, разнесённые панелями. Уникальный split.
export default function Modes({ onPrimary }) {
  return (
    <section className="bg-[#0D0D0F] text-[#EDEDED] border-t border-[#141416]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <p className="mono-label mb-3">// два режима</p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            Работайте так, как удобно <span className="text-[#6E6E76]">именно вам</span>
          </h2>
          <p className="mt-3 text-[#8A8A8F]">Один и тот же ученик может «вырасти» из заметки в полноценный аккаунт. Без потери истории.</p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-stretch">
          {/* Соло */}
          <div className="rounded-2xl border border-[#1E1E22] bg-[#0A0A0B] p-7">
            <div className="font-mono text-[12px] text-brand-400 mb-4">режим_A · соло</div>
            <h3 className="font-display font-semibold text-2xl">Ведёте сами, без регистрации учеников</h3>
            <p className="mt-3 text-sm text-[#8A8A8F] leading-relaxed">
              Добавляете ученика как «заглушку» — просто имя и контакт. Ему ничего не приходит, аккаунт не нужен.
              Посещаемость и долг считаются как у обычного.
            </p>
            <div className="mt-5 space-y-2 font-mono text-[12px] text-[#8A8A8F]">
              <div className="flex items-center gap-2"><span className="text-[#3A3A40]">01</span> добавил «Вася (telegram)»</div>
              <div className="flex items-center gap-2"><span className="text-[#3A3A40]">02</span> отметил посещения → долг растёт</div>
              <div className="flex items-center gap-2"><span className="text-[#3A3A40]">03</span> внёс оплату вручную</div>
            </div>
          </div>

          {/* разделитель */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="flex-1 w-px bg-[#1E1E22]" />
            <span className="my-3 font-mono text-xs text-[#5A5A60] rotate-0">или</span>
            <div className="flex-1 w-px bg-[#1E1E22]" />
          </div>

          {/* С учениками */}
          <div className="rounded-2xl border border-brand-600/30 bg-gradient-to-br from-[#0A0A0B] to-[#12101A] p-7">
            <div className="font-mono text-[12px] text-brand-400 mb-4">режим_B · с учениками</div>
            <h3 className="font-display font-semibold text-2xl">Подключаете учеников — они видят своё</h3>
            <p className="mt-3 text-sm text-[#8A8A8F] leading-relaxed">
              Находите ученика по нику, отправляете приглашение в группу. Он принимает — и видит расписание, ДЗ,
              посещаемость, долг и чат. А заглушку переносите на его аккаунт вместе со всей историей.
            </p>
            <div className="mt-5 space-y-2 font-mono text-[12px] text-[#8A8A8F]">
              <div className="flex items-center gap-2"><span className="text-[#3A3A40]">01</span> нашёл @vasya → пригласил</div>
              <div className="flex items-center gap-2"><span className="text-[#3A3A40]">02</span> ученик принял → в группе</div>
              <div className="flex items-center gap-2"><span className="text-brand-400">03</span> перенёс историю заглушки → на него</div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={onPrimary} className="h-11 px-6 rounded-lg bg-white text-[#0A0A0B] text-sm font-semibold hover:bg-[#EDEDED] transition-colors cursor-pointer">
            Попробовать оба режима
          </button>
        </div>
      </div>
    </section>
  )
}
