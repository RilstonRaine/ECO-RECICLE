// src/store/index.js
import { reactive } from 'vue'

const store = reactive({
  token: null,
  usuario: null,

  setAuth({ token, usuario }) {
    this.token = token
    this.usuario = usuario
    localStorage.setItem('auth', JSON.stringify({ token, usuario }))
  },

  restore() {
    const saved = JSON.parse(localStorage.getItem('auth') || 'null')
    if (saved?.token && saved?.usuario) {
      this.token = saved.token
      this.usuario = saved.usuario
    }
  },

  logout() {
    this.token = null
    this.usuario = null
    localStorage.removeItem('auth')
  }

  

})

store.restore()
export default store
