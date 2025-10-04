<script setup>
const { data: courses } = useFetch("/api/courses");

function generateCourse(courseId) {
  navigateTo(`/courses/new/${courseId}`);
}

function viewCourse(courseId) {
  navigateTo(`/courses/${courseId}`);
}
</script>

<template>
  <div class="text">
    <h1>Courses</h1>
  </div>
  <div v-if="courses == undefined"></div>
  <div v-else>
    <div class="grid grid-cols-4 gap-4">
      <Card v-for="course in courses">
        <template #title>{{ course.name }}</template>
        <template #subtitle>{{ course.program.name }}</template>
        <template #content>
          <p class="m-0">{{ course.description }}</p>
          <ProgressBar :value="course.completion * 100" class="my-4" />
        </template>
        <template #footer>
          <div class="mt-1">
            <Button v-if="course.status == 'draft'" label="Generate" @click="generateCourse(course.id)" class="w-full" />
            <Button v-else label="Open" @click="viewCourse(course.id)" class="w-full" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
