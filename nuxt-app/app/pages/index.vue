<script setup>
const { data } = useFetch("/api/courses");
const courses = reactive(data);
</script>

<template>
  <div class="text">
    <h1>Courses</h1>
    <p v-if="courses.length == 0">Create a course to get started.</p>
  </div>
  <div v-if="courses == undefined"></div>
  <div v-else>
    <div class="grid grid-cols-4 gap-4">
      <CourseCard v-for="course in courses" :course="course" @statusChanged="(newStatus) => course.status = newStatus" />
    </div>
  </div>
</template>
