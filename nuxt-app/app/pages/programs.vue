<script setup>
const { data } = useFetch("/api/programs");
</script>

<template>
  <h1>Programs</h1>
  <div class="grid grid-cols-4 gap-4">
    <Card v-for="program in data">
      <template #title>{{ program.name }}</template>
      <template #content>
        <p class="m-0">{{ program.description }}</p>
      </template>
      <template #footer>
        <div class="mt-1">
          <Button label="Open" class="w-full" />
        </div>
      </template>
    </Card>
  </div>
</template>
