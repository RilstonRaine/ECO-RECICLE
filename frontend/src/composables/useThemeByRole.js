// src/composables/useThemeByRole.js
import { watchEffect } from 'vue'
import store from '@/store'

export function useThemeByRole() {
  watchEffect(() => {
    const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
    const u = store?.state?.usuario ?? store?.usuario ?? authLS?.usuario
    const isPJ = u?.tipo_usuario === 'ponto_coleta'
    document.documentElement.classList.toggle('theme-pj', isPJ)
  })

  // multi-aba: reage a mudanças no localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth') {
      const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
      const u = store?.state?.usuario ?? store?.usuario ?? authLS?.usuario
      const isPJ = u?.tipo_usuario === 'ponto_coleta'
      document.documentElement.classList.toggle('theme-pj', isPJ)
    }
  })
}
