<template>
  <div class="card-metric card-center-mobile p-4">
    <div class="d-flex justify-content-between align-items-center">
      <h6 class="mb-0">{{ titulo }}</h6>
      <slot name="icon"></slot>
    </div>
    <div class="display-6 fw-bold mt-2">{{ valor }}</div>
  </div>
</template>

<style>
.card-metric{
  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: var(--border-soft);
  color: var(--text-primary);
}
.card-metric .text-muted{
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .card-center-mobile {
    text-align: center;
  }
  .card-center-mobile .d-flex {
    justify-content: center !important;
  }
}
</style>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  valor: { type: [String, Number], default: 0 }
})
</script>

