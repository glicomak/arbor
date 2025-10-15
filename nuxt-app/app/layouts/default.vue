<script setup>
const items = ref([
  { label: "Arbor", route: "/" },
  { label: "Programs", route: "/programs" },
  {
    label: "New",
    items: [
      { label: "Program", route: "/programs/new" },
      { label: "Course", route: "/courses/new" }
    ]
  },
]);

const isLightMode = ref(true);

onMounted(() => {
  const storedMode = localStorage.getItem("mode");
  if (storedMode == "dark") {
    toggleMode();
  }
});

function toggleMode() {
  document.documentElement.classList.toggle("my-app-dark");
  isLightMode.value = !isLightMode.value;
  localStorage.setItem("mode", "dark");
}
</script>

<template>
  <Menubar :model="items" class="font-medium">
    <template #item="{ item, props, hasSubmenu }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
      </a>
  </template>
    <template #end>
      <Button :icon="'pi ' + (isLightMode ? 'pi-sun' : 'pi-moon')" @click="toggleMode" class="p-button-text p-button-secondary" />
    </template>
  </Menubar>
  <slot />
</template>
