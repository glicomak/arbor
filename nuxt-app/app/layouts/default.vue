<template>
  <Menubar :model="items" />
  <slot />
</template>

<script setup>
const items = ref([
  { label: 'Arbor' },
  { label: 'Courses' },
  { label: 'Degrees' }
]);
</script>
