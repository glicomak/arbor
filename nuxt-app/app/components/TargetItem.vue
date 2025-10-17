<script setup>
const { target } = defineProps({
  target: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(["statusChanged"]);

const checked = computed({
  get() {
    return target.status === "complete";
  },
  async set(value) {
    const newStatus = value ? "complete" : "pending";

    await $fetch(`/api/targets/${target.id}/status`, {
      method: "PATCH",
      body: { status: newStatus }
    });

    emit("statusChanged", newStatus);
  }
});
</script>

<template>
  <li v-tooltip.top="target.source" class="my-3 flex items-start">
    <Checkbox v-model="checked" class="mr-4 mt-3" binary />
    <div class="flex flex-col">
      <span>{{ target.text }}</span>
      <span class="text-sm">{{ target.source }}</span>
    </div>
  </li>
</template>
