<template>
  <div v-if="show" class="info-banner">
    <div class="info-banner__content">
      <strong class="tag">{{ titulo }}</strong>
      <p class="msg">{{ mensagem }}</p>
    </div>

    <div class="info-banner__actions">
      <a
        v-if="ctaText && ctaHref"
        :href="ctaHref"
        target="_blank"
        rel="noopener"
        class="link"
      >{{ ctaText }}</a>

      <button class="close" @click="fechar" aria-label="Fechar aviso">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  // OBS: no template você usa kebab-case (cta-text), aqui vira camelCase
  titulo: { type: String, default: 'Informativo' },
  mensagem: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaHref: { type: String, default: '' },
  storageKey: { type: String, default: 'ecor_info_banner' },
})

const show = ref(true)

onMounted(() => {
  try {
    const v = localStorage.getItem(props.storageKey)
    if (v === 'hidden') show.value = false
  } catch {}
})

function fechar() {
  show.value = false
  try { localStorage.setItem(props.storageKey, 'hidden') } catch {}
}
</script>

<style scoped>
.info-banner{
  display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding:12px 14px; border:1px solid var(--ecor-mint-150); border-radius:12px;
  background: var(--ecor-mint-50); box-shadow: 0 6px 16px rgba(2,6,4,.04);
}
.info-banner__content{ display:flex; gap:.6rem; align-items:center; flex:1; }
.tag{ color: var(--ecor-mint-700); }
.msg{ margin:0; color: var(--ecor-ink-700); }
.info-banner__actions{ display:flex; align-items:center; gap:.5rem; }
.link{ font-weight:600; color: var(--ecor-mint-700); text-decoration:none; }
.link:hover{ text-decoration:underline; }
.close{
  border:0; background:transparent; font-size:18px; line-height:1;
  color: var(--ecor-ink-500); cursor:pointer; padding:6px; border-radius:8px;
}
.close:hover{ background: rgba(2,6,4,.06); }
</style>
