<script setup>
const items = ref([
  { label: "Arbor" },
  { label: "Programs" }
]);
</script>

<template>
  <Menubar :model="items" class="font-medium" />
  <slot />
</template>
