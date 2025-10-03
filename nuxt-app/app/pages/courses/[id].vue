<script setup>
const route = useRoute();
const courseId = route.params.id;

const { data: course } = useFetch(`/api/courses/${courseId}`);
</script>

<template>
  <div v-if="course == undefined" />
  <div v-else>
    <div class="text">
      <h1>{{ course.name }}</h1>
      <p>{{ course.description }}</p>
      <p><span class="font-semibold">Source: </span>{{ course.source }}</p>
    </div>
    <Accordion :value="['0']" multiple>
      <AccordionPanel v-for="week in course.weeks" :value="week.serial">
        <AccordionHeader>Week {{ week.serial }}: {{ week.name }}</AccordionHeader>
        <AccordionContent>
          <ul>
            <li v-for="target in week.targets" v-tooltip.top="target.source">{{ target.text }}</li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>
