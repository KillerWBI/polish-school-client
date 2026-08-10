import { createContext } from 'react'

// Контекст вынесен из authStore.jsx: файл, экспортирующий и компонент, и не-компонент,
// ломает Fast Refresh — правка провайдера перезагружала бы страницу целиком.
export const AuthContext = createContext(null)
