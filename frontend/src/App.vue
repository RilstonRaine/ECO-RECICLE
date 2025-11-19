<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar />
    <router-view />
    <!-- modal global, fora do router-view -->
    <ProUpsellModal />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import ProUpsellModal from '@/components/ProUpsellModal.vue'
</script>
