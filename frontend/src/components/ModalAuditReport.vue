<!-- src/components/ModalAuditReport.vue -->
<template>
  <div class="ecor-modal">
    <div class="ecor-backdrop" @click="closeModal"></div>
    <div class="ecor-panel">
      <button class="ecor-close" @click="closeModal">×</button>
      <h5 class="mb-3">Auditoria do Descarte</h5>
      <div v-if="descarte">
        <p><strong>ID:</strong> {{ descarte.id }}</p>
        <p><strong>Tipo de resíduo:</strong> {{ descarte.tipo_residuo }}</p>
        <p><strong>Data de registro:</strong> {{ formatDate(descarte.data_registro) }}</p>
        <img v-if="descarte.foto_item_url" :src="descarte.foto_item_url" alt="Foto do item" class="img-fluid" />
        <img v-if="descarte.foto_local_url" :src="descarte.foto_local_url" alt="Foto do local" class="img-fluid" />
        
        <!-- Formulário para reportar problema -->
        <textarea v-model="descricao" placeholder="Descreva o problema..." class="form-control" rows="4"></textarea>
        <button @click="reportarProblema" class="btn btn-danger mt-3">Reportar Problema</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { auditoriaApi } from '@/services/api'

const toast = useToast()

const descarte = ref(null)  // Detalhes do descarte
const descricao = ref('')   // Descrição do problema

// Função para formatar data
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

// Função para fechar o modal
function closeModal() {
  // Logic to close modal
}

// Função para reportar problema
async function reportarProblema() {
  try {
    await auditoriaApi.reportarProblema(descarte.value.id, descricao.value)
    toast.success('Problema reportado com sucesso!')
    closeModal()
  } catch (e) {
    toast.error('Falha ao reportar problema.')
  }
}

</script>

<style scoped>
/* Style similar to previous modal */
</style>
