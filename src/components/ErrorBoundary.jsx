import { Component } from 'react'

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
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1629] p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h1 className="text-xl font-semibold text-white mb-2">Что-то пошло не так</h1>
          <p className="text-sm text-slate-400 mb-6">
            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-red-300 text-left bg-black/30 p-3 rounded-lg mb-5 overflow-auto max-h-40">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReload}
              className="h-11 px-5 rounded-xl text-white bg-brand-600 hover:bg-brand-500 cursor-pointer transition-colors font-medium">
              Перезагрузить
            </button>
            <button
              onClick={this.handleReset}
              className="h-11 px-5 rounded-xl text-slate-300 bg-white/[0.07] hover:bg-white/[0.12] cursor-pointer transition-colors font-medium">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }
}
