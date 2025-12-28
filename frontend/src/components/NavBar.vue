<template>
  <v-app-bar class="app-bar-glass" elevation="0" flat scroll-behavior="elevate">
    <v-container class="d-flex align-center py-2">
      <!-- Brand / Logo -->
      <div class="d-flex align-center mr-4">
        <v-avatar color="primary" size="32" variant="tonal">
          <v-icon size="20">mdi-pulse</v-icon>
        </v-avatar>
        <span class="ml-2 text-body-1 font-weight-bold brand">VibeActually</span>
      </div>

      <!-- Nav Links -->
      <div class="d-flex align-center nav-links">
        <v-btn
          v-for="item in navItems"
          :key="item.route"
          :class="['mx-1 nav-btn', { 'is-active': isActive(item.route) }]"
          rounded="pill"
          size="small"
          :to="item.route"
          :variant="isActive(item.route) ? 'flat' : 'text'"
        >
          <v-icon v-if="item.icon" size="18" start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </div>

      <v-spacer />

      <!-- Theme toggle -->
      <v-divider class="mx-3 opacity-divider" vertical />

      <v-tooltip location="bottom" :text="`Switch to ${isDark ? 'light' : 'dark'} theme`">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="theme-toggle"
            icon
            variant="text"
            @click="toggleTheme"
          >
            <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'

  const navItems = [
    { title: 'Dashboard', route: '/', icon: 'mdi-view-dashboard-outline' },
    { title: 'Chat', route: '/chat', icon: 'mdi-chat-processing-outline' },
    { title: 'Import', route: '/upload', icon: 'mdi-cloud-upload-outline' },
  ]

  const route = useRoute()
  const theme = useTheme()
  const isDark = computed(() => theme.current.value.dark)

  const isActive = to => (to === '/') ? route.path === '/' : route.path.startsWith(to)

  function toggleTheme () {
    theme.global.name.value = isDark.value ? 'light' : 'dark'
  }
</script>

<style scoped>
.app-bar-glass {
  backdrop-filter: saturate(180%) blur(12px);
  background: color-mix(in srgb, var(--v-theme-surface) 82%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--v-theme-outline) 20%, transparent);
}

.nav-links {
  gap: 2px;
}

/* Brand emphasis */
.brand { letter-spacing: 0.2px; }

/* Vuexy-inspired pill navigation */
.nav-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  height: 36px;
  border-radius: 9999px;
  padding-inline: 12px;
  color: color-mix(in srgb, var(--v-theme-on-surface) 92%, transparent);
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.nav-btn:hover {
  background: color-mix(in srgb, var(--v-theme-primary) 8%, transparent);
}

.nav-btn.is-active {
  background: color-mix(in srgb, var(--v-theme-primary) 14%, transparent);
  color: var(--v-theme-primary);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--v-theme-primary) 36%, transparent);
}

.theme-toggle {
  color: color-mix(in srgb, var(--v-theme-on-surface) 82%, transparent);
}

.opacity-divider { opacity: 0.3; }
</style>
