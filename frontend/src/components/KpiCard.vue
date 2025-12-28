<template>
  <v-card
    class="pa-4"
    :color="cardColor"
    :elevation="elevation"
    :loading="loading"
    :rounded="rounded"
    :variant="variant"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex flex-column">
        <span class="text-overline text-medium-emphasis">{{ title }}</span>
        <div class="d-flex align-end gap-2">
          <span class="text-h4 font-weight-bold">{{ displayValue }}</span>
          <span v-if="subtitle" class="text-caption text-medium-emphasis">{{ subtitle }}</span>
        </div>
      </div>
      <v-avatar :color="color" size="40" variant="tonal">
        <v-icon :icon="icon" />
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    title: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: 'mdi-information-outline' },
    color: { type: String, default: 'primary' },
    loading: { type: Boolean, default: false },
    variant: { type: String, default: 'flat' },
    elevation: { type: [Number, String], default: undefined },
    rounded: { type: [Boolean, String, Number], default: 'xl' },
  })

  const cardColor = computed(() => (props.variant === 'tonal' ? props.color : undefined))

  const displayValue = computed(() => props.value)
</script>

<style scoped>
.gap-2 { gap: 8px; }
</style>
