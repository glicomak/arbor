<script setup>
const { course } = defineProps({
  course: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(["statusChanged"]);

function generateCourse() {
  navigateTo(`/courses/new/${course.id}`);
}

function viewCourse() {
  navigateTo(`/courses/${course.id}`);
}

async function changeStatus(status) {
  await $fetch(`/api/courses/${course.id}/status`, {
    method: "PATCH",
    body: { status },
    headers: { "Content-Type": "application/json" }
  });
  emit("statusChanged", status);
}
</script>

<template>
  <Card>
    <template #title>{{ course.name }}</template>
    <template v-if="'program' in course" #subtitle>{{ course.program.name }}</template>
    <template #content>
      <div class="mt-2 mb-4">
        <Tag v-if="course.status == 'draft'" severity="secondary" value="DRAFT" />
        <Tag v-if="course.status == 'pending'" severity="info" value="PENDING" />
        <Tag v-if="course.status == 'active'" severity="contrast" value="ACTIVE" />
        <Tag v-if="course.status == 'complete'" value="COMPLETE" />
      </div>
      <p class="m-0">{{ course.description }}</p>
      <ProgressBar :value="Math.round(course.completion * 10000) / 100" class="my-4" />
    </template>
    <template #footer>
      <div>
        <Button v-if="course.status == 'draft'" label="Generate" @click="generateCourse(course.id)" class="w-full" />
        <Button v-else label="Open" @click="viewCourse(course.id)" class="w-full" />
      </div>
      <div v-if="course.status != 'draft'" class="mt-4 flex justify-between gap-3">
        <Button v-if="course.status != 'pending'" v-tooltip.top="'Mark as pending'" icon="pi pi-folder" severity="secondary" @click="changeStatus('pending')" class="flex-1" />
        <Button v-if="course.status != 'active'" v-tooltip.top="'Activate'" icon="pi pi-star" severity="secondary" @click="changeStatus('active')" class="flex-1" />
        <Button v-if="course.status == 'active'" v-tooltip.top="'Refresh dates'" icon="pi pi-sync" severity="secondary" @click="changeStatus('active')" class="flex-1" />
        <Button v-if="course.status != 'complete'" v-tooltip.top="'Mark as complete'" icon="pi pi-check-circle" severity="secondary" @click="changeStatus('complete')" class="flex-1" />
      </div>
    </template>
  </Card>
</template>
