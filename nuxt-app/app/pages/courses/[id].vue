<script setup>
const route = useRoute();
const courseId = route.params.id;

const { data } = useFetch(`/api/courses/${courseId}`);
const course = reactive(data);
</script>

<template>
  <div v-if="course == undefined" />
  <div v-else>
    <div class="text">
      <h1>{{ course.name }}</h1>
      <p>{{ course.description }}</p>
      <p><span class="font-semibold">Source: </span>{{ course.source }}</p>
    </div>
    <Accordion multiple>
      <WeekItem v-for="week in course.weeks" :week="week" @statusChanged="(newStatus) => course.status = newStatus" />
    </Accordion>
  </div>
</template>
