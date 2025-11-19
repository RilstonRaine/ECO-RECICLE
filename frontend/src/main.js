// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // o store já restaura o auth sozinho (localStorage)
import 'leaflet/dist/leaflet.css'


// Estilos globais
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'   // << ícones modernos
import '@/assets/style.css'   // seus estilos antigos (ok manter)

// Toasts
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// (Opcional) se seu store tiver um método restore(), ele só será chamado se existir
store.restore?.()

createApp(App)
  .use(router)
  .use(Toast, { position: POSITION.TOP_RIGHT, timeout: 3000 })
  .mount('#app')
