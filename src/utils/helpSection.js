// Текущий маршрут → секция справки (#anchor на /help).
const HELP_MAP = [
  [/^\/dashboard/, 'dashboard'], [/^\/groups/, 'groups'], [/^\/homework/, 'homework'],
  [/^\/attendance/, 'attendance'], [/^\/payments/, 'payments'], [/^\/students/, 'students'],
  [/^\/calendar/, 'calendar'], [/^\/individual-courses/, 'individual-courses'],
  [/^\/individual-lessons/, 'individual-lessons'], [/^\/profile/, 'profile'],
  [/^\/quiz/, 'quiz'],
  [/^\/plans/, 'plans'],
  [/^\/settings/, 'profile'],
]

export const helpSectionFor = (pathname) => (HELP_MAP.find(([re]) => re.test(pathname)) || [])[1] || ''
