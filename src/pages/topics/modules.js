// Модули трека. Бэкенд хранит план плоским списком подтем; модуль — подпись у подтемы
// (moduleId + moduleTitle). Здесь подтемы собираются обратно в модули по порядку появления.
// У старых треков moduleId нет — они становятся одним модулем.

export const GATE = 50 // следующее открывается, когда предыдущее освоено на ≥50%

const avg = (steps) => steps.reduce((a, s) => a + (Number(s.mastery) || 0), 0) / (steps.length || 1)

// roadmap (уже отсортирован по order) → [{ id, title, steps, mastery }]
export const groupModules = (roadmap) => {
  const map = new Map()
  for (const s of roadmap) {
    const id = s.moduleId || 'default'
    if (!map.has(id)) map.set(id, { id, title: s.moduleTitle || null, steps: [] })
    map.get(id).steps.push(s)
  }
  return [...map.values()].map((m) => ({ ...m, mastery: avg(m.steps) }))
}

// Закрыт ли шаг. Модулей несколько — гейт между модулями, внутри модуля всё открыто
// (строгая очередь на 20–30 подтем превращает трек в ожидание). Модуль один (узкая тема,
// старый трек) — гейт между шагами, как было до модулей.
export const isStepLocked = (modules, mi, si) => {
  if (modules.length > 1) return mi > 0 && modules[mi - 1].mastery < GATE
  const prev = modules[0].steps[si - 1]
  return !!prev && (Number(prev.mastery) || 0) < GATE
}
