<script setup>
const { data } = useFetch("/api/courses");
</script>

<template>
  <h1>Courses</h1>
  <div class="grid grid-cols-4 gap-4">
    <Card v-for="course in data">
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
</template>
