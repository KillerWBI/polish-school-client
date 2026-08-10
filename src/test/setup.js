import '@testing-library/jest-dom/vitest'

// jsdom не реализует matchMedia, а его дёргают компоненты с адаптивной логикой
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })
}
