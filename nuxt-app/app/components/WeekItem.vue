<script setup>
const { week } = defineProps({
  week: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(["statusChanged"]);

const checked = computed({
  get() {
    return week.status === "complete";
  },
  async set(value) {
    const newStatus = value ? "complete" : "pending";

    await $fetch(`/api/weeks/${week.id}/status`, {
      method: "PATCH",
      body: { status: newStatus }
    });

    emit("statusChanged", newStatus);
  }
});

function formatWeekRange(dateStr) {
  const date = new Date(dateStr);
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + 6);

  const options = { day: '2-digit', month: 'short', year: '2-digit' };

  const startFormatted = date.toLocaleDateString('en-GB', options);
  const endFormatted = endDate.toLocaleDateString('en-GB', options);

  return `${startFormatted} to ${endFormatted}`;
}

function isCurrentWeek(startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
}
</script>

<template>
  <AccordionPanel :value="week.serial">
    <AccordionHeader>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-4">
          <Checkbox v-model="checked" binary />
          <span>Week {{ week.serial }}: {{ week.name }}</span>
        </div>
        <div class="flex items-center gap-4">
          <i v-if="isCurrentWeek(week.startDate)" class="pi pi-map-marker"></i>
          <span class="mr-4">{{ formatWeekRange(week.startDate) }}</span>
        </div>
      </div>
    </AccordionHeader>
    <AccordionContent>
      <ul>
        <TargetItem v-for="target in week.targets" :target="target" @statusChanged="(newStatus) => target.status = newStatus" />
      </ul>
    </AccordionContent>
  </AccordionPanel>
</template>
