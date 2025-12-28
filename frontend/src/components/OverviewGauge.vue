<template>
  <div class="d-flex align-center justify-center py-6">
    <v-fade-transition mode="out-in">
      <v-progress-circular
        :key="loading ? 'loading' : value"
        :color="color"
        :indeterminate="loading"
        :model-value="loading ? 0 : value"
        :size="size"
        :width="width"
      >
        <div class="text-center">
          <div class="text-h4 font-weight-bold">{{ value }}%</div>
          <div class="text-caption text-medium-emphasis">{{ label }}</div>
        </div>
      </v-progress-circular>
    </v-fade-transition>
  </div>
</template>

<script setup>
  defineProps({
    value: { type: Number, default: 0 },
    color: { type: String, default: 'primary' },
    label: { type: String, default: 'Readiness score' },
    loading: { type: Boolean, default: false },
    size: { type: [Number, String], default: 220 },
    width: { type: [Number, String], default: 18 },
  })
</script>
