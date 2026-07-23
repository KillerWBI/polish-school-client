import { Component } from 'react'
import { captureException } from '../utils/sentry.js'

// Глобальный перехватчик ошибок рендера — спасает от белого экрана.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    captureException(error, { extra: { componentStack: info?.componentStack } })
  }

  // При навигации назад/вперёд (в т.ч. по кнопке «Назад» ниже) снимаем ошибку —
  // тогда рендерится уже предыдущий (рабочий) роут, а не тот же сломанный.
  componentDidMount() {
    this._onPop = () => { if (this.state.error) this.setState({ error: null }) }
    window.addEventListener('popstate', this._onPop)
  }

  componentWillUnmount() {
    if (this._onPop) window.removeEventListener('popstate', this._onPop)
  }

  handleReload = () => {
    window.location.reload()
  }

  // «Назад» — на предыдущую рабочую страницу. history.back() меняет URL и стреляет
  // popstate → ошибка снимается → рендерится предыдущий роут. Если истории нет — на главную.
  handleBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.assign('/')
  }

  handleHome = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6] p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Что-то пошло не так</h1>
          <p className="text-sm text-slate-500 mb-6">
            Произошла непредвиденная ошибка. Вернитесь на предыдущую страницу или на главную.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-red-600 text-left bg-red-50 border border-red-100 p-3 rounded-lg mb-5 overflow-auto max-h-40">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={this.handleBack}
              className="h-11 px-5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors font-medium">
              Назад
            </button>
            <button
              onClick={this.handleHome}
              className="h-11 px-5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors font-medium">
              На главную
            </button>
            <button
              onClick={this.handleReload}
              className="h-11 px-5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors font-medium">
              Перезагрузить
            </button>
          </div>
        </div>
      </div>
    )
  }
}
