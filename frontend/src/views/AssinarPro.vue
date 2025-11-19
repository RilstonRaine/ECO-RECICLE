<!-- src/views/AssinarPro.vue -->
<template>
  <div class="container py-4" style="max-width:720px;">
    <h1 class="mb-3">Plano PRO</h1>

    <p v-if="status">
      Plano atual: <strong>{{ (status.plano || 'free').toUpperCase() }}</strong>
      <span v-if="status.pro_ativo_ate">
        (ativo até {{ new Date(status.pro_ativo_ate).toLocaleString() }})
      </span>
    </p>

    <button
      v-if="!ativo"
      class="btn btn-primary"
      @click="assinar"
      :disabled="loading"
    >
      {{ loading ? 'Ativando…' : 'Assinar PRO' }}
    </button>

    <div v-else class="alert alert-success mt-3">
      Sua licença PRO está ativa. 🎉
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { upgradePro, getMinhaLicenca, clearLicencaCache } from '@/services/licenca'

const route = useRoute()
const status = ref(null)
const loading = ref(false)

const ativo = computed(() =>
  !!(status.value?.plano === 'pro' &&
     (status.value?.pro_ativo || (status.value?.pro_ativo_ate && new Date(status.value.pro_ativo_ate) > new Date())))
)

async function carregar() {
  status.value = await getMinhaLicenca()
}

async function assinar() {
  try {
    loading.value = true
    await upgradePro(10)
    clearLicencaCache()
    await carregar()
    alert('PRO ativado com sucesso!')
  } catch (e) {
    console.error(e)
    alert('Não foi possível ativar o PRO.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await carregar()

})
</script>
