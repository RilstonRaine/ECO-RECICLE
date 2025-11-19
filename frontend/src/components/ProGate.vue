<!-- src/components/ProGate.vue -->
<template>
  <div v-if="liberado"><slot /></div>
  <div v-else class="alert alert-info">
    Este recurso é exclusivo do <strong>Plano PRO</strong>.
    <router-link :to="{ name:'assinar-pro', query: { from: redirectTo } }">Assinar PRO</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLicencaCached } from '@/services/licenca'

const props = defineProps({ redirectTo: { type: String, default: '' } })
const liberado = ref(false)

onMounted(async () => {
  try {
    const lic = await getLicencaCached()
    liberado.value = !!(lic?.plano === 'pro' && (lic?.pro_ativo || (lic?.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date())))
  } catch {
    liberado.value = false
  }
})
</script>
