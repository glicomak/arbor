<script setup>
const route = useRoute();
const programId = route.params.id;

const { data: program } = useFetch(`/api/programs/${programId}`);
</script>

<template>
  <div v-if="program == undefined"></div>
  <div v-else>
    <h1>{{ program.name }}</h1>
    <div class="grid grid-cols-4 gap-4">
      <Card v-for="course in program.courses">
        <template #title>{{ course.name }}</template>
        <template #subtitle>{{ course.program.name }}</template>
        <template #content>
          <p class="m-0">{{ course.description }}</p>
        </template>
        <template #footer>
          <div class="mt-1">
            <Button label="Open" class="w-full" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
