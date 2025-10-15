<script setup>
const route = useRoute();
const courseId = route.params.id;

const fixedFields = ref(null);
const fields = ref(null);
const isLoading = ref(false);

const { data: course } = await useFetch(`/api/courses/${courseId}`);

onMounted(async () => {
  fixedFields.value = [
    {
      question: "Name",
      answer: course.value.name
    },
    {
      question: "Description",
      answer: course.value.description
    },
    {
      question: "Credits",
      answer: course.value.credits
    }
  ];

  fields.value = [{
    question: "Initial prompt",
    answer: course.value.prompt,
    isFixed: false
  }];
});

async function submit() {
  isLoading.value = true;

  const rawFields = toRaw(fields.value);
  const requirements = rawFields.map(({ isFixed, ...requirement }) => requirement);
  const data = { requirements };

  const response = await $fetch(`/api/courses/counsel/${courseId}`, {
    method: "POST",
    body: data,
    headers: { "Content-Type": "application/json" }
  });

  fields.value.forEach(requirement => {
    requirement.isFixed = true;
  });

  if ("questions" in response) {
    for (const question of response.questions) {
      fields.value.push({
        question,
        answer: "",
        isFixed: false
      });
    }
  } else if ("id" in response) {
    navigateTo(`/courses/${response.id}`);
  }

  isLoading.value = false;
}
</script>

<template>
  <div v-if="fixedFields == null || fields == null" />
  <div v-else>
    <div class="text">
      <h1>Generate New Course</h1>
      <p>Fill out the following fields to generate a new course as per your requirements.</p>
      <div v-for="(field, index) in fixedFields">
        <FloatLabel variant="in" class="my-6">
          <Textarea
            :id="`field-${index}`"
            v-model="field.answer"
            :disabled="true"
            autoResize
            rows="3"
            class="w-full"
          />
          <label :for="`field-${index}`">{{field.question}}</label>
        </FloatLabel>
      </div>
      <div v-for="(field, index) in fields">
        <FloatLabel variant="in" class="my-6">
          <Textarea
            :id="`field-${index}`"
            v-model="field.answer"
            :disabled="field.isFixed"
            autoResize
            rows="3"
            class="w-full"
          />
          <label :for="`field-${index}`">{{field.question}}</label>
        </FloatLabel>
      </div>
      <Button
        :disabled="isLoading"
        @click="submit"
        class="flex items-center gap-2"
      >
        <template v-if="isLoading">Generating...</template>
        <template v-else>Generate</template>
      </Button>
    </div>
  </div>
</template>
