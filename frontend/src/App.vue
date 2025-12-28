<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
  //
</script>

<style>
/* Subtle app background + global typography */
:root, html, body, .v-application {
  font-family: 'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.v-application {
  background:
    radial-gradient(1200px 600px at 10% -10%, color-mix(in srgb, var(--v-theme-primary) 6%, transparent), transparent),
    radial-gradient(800px 400px at 110% 10%, color-mix(in srgb, var(--v-theme-secondary) 5%, transparent), transparent),
    linear-gradient(180deg, color-mix(in srgb, var(--v-theme-surface) 100%, transparent), color-mix(in srgb, var(--v-theme-surface) 100%, transparent));
}
</style>
