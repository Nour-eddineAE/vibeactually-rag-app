<template>
  <v-card class="h-100" :loading="loading">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2" :color="color">{{ icon }}</v-icon>
      <span class="text-subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-chip :color="color" size="small" variant="tonal">{{ items?.length || 0 }}</v-chip>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <div v-if="!items || items.length === 0" class="pa-6 text-medium-emphasis">
        <em>{{ emptyText }}</em>
      </div>
      <v-list v-else class="scroll" density="comfortable" lines="two">
        <v-list-item v-for="(item, idx) in items" :key="idx">
          <v-list-item-title class="font-weight-medium">{{ getPrimary(item) }}</v-list-item-title>
          <v-list-item-subtitle v-if="getSecondary(item)">{{ getSecondary(item) }}</v-list-item-subtitle>
          <template #append>
            <div v-if="hasValue(item)" class="d-flex align-center ml-2 gap-2 text-medium-emphasis">
              <span class="text-caption">{{ valueLabel(item) }}</span>
              <v-chip
                v-if="isPercentItem(item)"
                :color="valueColor(getValue(item))"
                size="x-small"
                variant="tonal"
              >
                {{ displayValue(getValue(item)) }}
              </v-chip>
              <v-chip
                v-else
                :color="color"
                size="x-small"
                variant="tonal"
              >
                {{ formatCount(getValue(item)) }}
              </v-chip>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
    emptyText: { type: String, default: 'No items found' },
    icon: { type: String, default: 'mdi-information-outline' },
    color: { type: String, default: 'primary' },
    loading: { type: Boolean, default: false },
    valueKey: { type: String, default: 'readiness' },
  })

  // attempt to derive sensible labels
  function getPrimary (item) {
    if (item == null) return ''
    if (typeof item === 'string' || typeof item === 'number') return String(item)
    const keys = Object.keys(item)
    const primaryKey = ['name', 'title', 'id', 'label'].find(k => keys.includes(k))
    return primaryKey ? String(item[primaryKey]) : JSON.stringify(item)
  }

  function getSecondary (item) {
    if (!item || typeof item !== 'object') return ''
    const omit = new Set([
      'name', 'title', 'id', 'label',
      // omit value-bearing keys to avoid duplication on the right
      props.valueKey,
      'readiness', 'score', 'percent', 'percentage', 'progress',
      'count', 'total', 'items', 'value',
    ])
    const first = Object.entries(item).find(([k, v]) => !omit.has(k) && (typeof v === 'string' || typeof v === 'number'))
    return first ? `${first[0]}: ${first[1]}` : ''
  }

  // readiness helpers
  function coerceNumber (v) {
    const n = Number(v)
    return Number.isFinite(n) ? n : Number.NaN
  }

  function getMatchedKey (item) {
    if (item == null || typeof item !== 'object') return null
    const keys = [
      props.valueKey,
      // percent-like keys
      'readiness', 'score', 'percent', 'percentage', 'progress',
      // count-like keys
      'count', 'total', 'items', 'value',
    ]
    for (const k of keys) {
      if (k && k in item) {
        const n = coerceNumber(item[k])
        if (!Number.isNaN(n)) return k
      }
    }
    return null
  }

  function getValue (item) {
    if (item == null || typeof item !== 'object') return Number.NaN
    const key = getMatchedKey(item)
    return key ? coerceNumber(item[key]) : Number.NaN
  }

  function hasValue (item) {
    const v = getValue(item)
    return Number.isFinite(v)
  }

  function normalizePercent (v) {
    // Accept 0..1 or 0..100 inputs
    const num = Number(v)
    if (!Number.isFinite(num)) return Number.NaN
    const n = num > 0 && num <= 1 ? num * 100 : num
    return Math.max(0, Math.min(100, n))
  }

  function displayValue (v) {
    const n = normalizePercent(v)
    return `${Math.round(n)}%`
  }

  function valueColor (v) {
    const n = normalizePercent(v)
    if (n >= 80) return 'success'
    if (n >= 50) return 'warning'
    return 'error'
  }

  // classification and formatting
  function isPercentKey (key) {
    return ['readiness', 'score', 'percent', 'percentage', 'progress'].includes(String(key))
  }

  function isPercentItem (item) {
    const key = getMatchedKey(item)
    if (key) return isPercentKey(key)
    // fallback: treat 0..1 or 0..100 as percent if clearly in range
    const v = getValue(item)
    if (!Number.isFinite(v)) return false
    const n = v > 0 && v <= 1 ? v * 100 : v
    return n >= 0 && n <= 100
  }

  function valueLabel (item) {
    return isPercentItem(item) ? 'Readiness:' : 'Count:'
  }

  function formatCount (v) {
    const n = Number(v)
    return Number.isFinite(n) ? Math.round(n).toString() : ''
  }
</script>

<style scoped>
.scroll { max-height: 320px; overflow: auto; }
.gap-2 { gap: 8px; }
</style>
