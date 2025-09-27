<script setup>
const { data: programs } = useFetch("/api/programs");

function viewProgram(programId) {
  navigateTo(`/programs/${programId}`);
}
</script>

<template>
  <h1>Programs</h1>
  <div class="grid grid-cols-4 gap-4">
    <div v-if="programs == undefined"></div>
    <div v-else>
      <Card v-for="program in programs">
        <template #title>{{ program.name }}</template>
        <template #content>
          <p class="m-0">{{ program.description }}</p>
        </template>
        <template #footer>
          <div class="mt-1">
            <NuxtLink :to="`/programs/${program.id}`" class="block">
              <Button label="Open" @click="viewProgram(program.id)" class="w-full" />
            </NuxtLink>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
