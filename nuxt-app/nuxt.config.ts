import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules: [
    ['@primevue/nuxt-module', {
      options: {
        theme: {
          preset: Aura,
          options: {
            darkModeSelector: true
          }
        }
      }
    }]
  ]
})
