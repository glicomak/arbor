<script setup>
const route = useRoute();
const programId = route.params.id;

const { data } = useFetch(`/api/programs/${programId}`);
const program = reactive(data);
</script>

<template>
  <div v-if="program == undefined" />
  <div v-else>
    <div class="text">
      <h1>{{ program.name }}</h1>
      <p>{{ program.description }}</p>
    </div>
    <div class="grid grid-cols-4 gap-4">
      <CourseCard v-for="course in program.courses" :course="course" @statusChanged="(newStatus) => course.status = newStatus" />
    </div>
  </div>
</template>
