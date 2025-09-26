<script setup>
const items = ref([
  { label: "Arbor", route: "/" },
  { label: "Programs", route: "/programs" }
]);
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
  </Menubar>
  <slot />
</template>
