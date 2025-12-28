<template>
  <v-card class="pa-0" :class="{ 'h-100': fillHeight }" :loading="loading">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2">{{ icon }}</v-icon>
      <span class="text-subtitle-1 font-weight-medium">{{ title }}</span>
      <v-chip
        v-if="badgeText"
        class="ml-2"
        :color="badgeColor"
        size="small"
        variant="tonal"
      >{{ badgeText }}</v-chip>
      <v-spacer />
      <slot name="header-right" />
    </v-card-title>
    <v-divider v-if="divider" />
    <v-card-text :class="contentClass">
      <slot />
    </v-card-text>
  </v-card>

</template>

<script setup>
  defineProps({
    title: { type: String, required: true },
    icon: { type: String, default: 'mdi-information-outline' },
    badgeText: { type: String, default: '' },
    badgeColor: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    fillHeight: { type: Boolean, default: true },
    divider: { type: Boolean, default: true },
    contentClass: { type: String, default: '' },
  })
</script>
