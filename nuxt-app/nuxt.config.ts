import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: [
    "primeicons/primeicons.css",
    "~/assets/css/main.css"
  ],
  devtools: { enabled: true },
  modules: [
    ['@primevue/nuxt-module', {
      options: {
        theme: {
          preset: Aura,
          options: {
            darkModeSelector: ".my-app-dark"
          }
        }
      }
    }]
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
});
