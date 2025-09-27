<script setup>
const items = ref([
  { label: "Arbor", route: "/" },
  { label: "Programs", route: "/programs" }
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
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span>{{ item.label }}</span>
        </a>
      </router-link>
    </template>
    <template #end>
      <Button :icon="'pi ' + (isLightMode ? 'pi-sun' : 'pi-moon')" @click="toggleMode" class="p-button-text p-button-secondary" />
    </template>
  </Menubar>
  <slot />
</template>
