<script setup>
const route = useRoute();
const programId = route.params.id;

const { data: program } = useFetch(`/api/programs/${programId}`);

function viewCourse(courseId) {
  navigateTo(`/courses/${courseId}`);
}
</script>

<template>
  <div v-if="program == undefined" />
  <div v-else>
    <div class="text">
      <h1>{{ program.name }}</h1>
      <p>{{ program.description }}</p>
    </div>
    <div class="grid grid-cols-4 gap-4">
      <Card v-for="course in program.courses">
        <template #title>{{ course.name }}</template>
        <template #subtitle>{{ program.name }}</template>
        <template #content>
          <p class="m-0">{{ course.description }}</p>
        </template>
        <template #footer>
          <div class="mt-1">
            <Button label="Open" @click="viewCourse(course.id)" class="w-full" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
