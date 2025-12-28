<template>
  <v-container class="py-4 fill-height" fluid>
    <v-row align="stretch" class="fill-height justify-center">
      <v-col class="d-flex flex-column" cols="12" lg="11" md="11">
        <v-card class="d-flex flex-column flex-grow-1">
          <!-- Header -->
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-database-search</v-icon>
              <span class="text-h6">Query Executor</span>
            </div>
            <div class="d-flex align-center">
              <v-btn class="mr-1" :disabled="!inputMessage && tableData.length === 0" variant="text" @click="clearAll">
                <v-icon start>mdi-close</v-icon>
                Clear
              </v-btn>
              <v-btn
                class="mr-2"
                color="primary"
                :disabled="!inputMessage || chatStore.loading"
                :loading="chatStore.loading"
                @click="handleSend"
              >
                <v-icon start>mdi-play-circle</v-icon>
                Run (Ctrl/⌘+Enter)
              </v-btn>
              <v-btn color="secondary" :disabled="tableData.length === 0" @click="exportJSON">
                <v-icon start>mdi-download</v-icon>
                Export JSON
              </v-btn>
            </div>
          </v-card-title>

          <!-- Input + Suggestions -->
          <v-card-text class="pt-0 pb-3">
            <v-row>
              <v-col cols="12" md="8">
                <v-textarea
                  v-model="inputMessage"
                  auto-grow
                  clearable
                  :disabled="chatStore.loading"
                  label="Write your request..."
                  rows="3"
                  @keydown.ctrl.enter.prevent="handleSend"
                  @keydown.enter.exact.prevent="handleSend"
                  @keydown.enter.shift.exact="() => {}"
                  @keydown.meta.enter.prevent="handleSend"
                />
                <div class="text-caption text-medium-emphasis mt-n2">Press Ctrl/⌘+Enter to run</div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center text-medium-emphasis text-caption mb-1">
                  <v-icon class="mr-1" size="16">mdi-lightbulb-on-outline</v-icon>
                  Try one of these:
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="s in suggestions"
                    :key="s"
                    class="mr-2 mb-2"
                    size="small"
                    variant="tonal"
                    @click="inputMessage = s"
                  >{{ s }}</v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Progress -->
          <v-progress-linear
            v-if="chatStore.loading"
            class="mx-4"
            color="primary"
            height="3"
            indeterminate
            rounded
          />

          <v-divider />

          <!-- Results area: Tabs -->
          <v-card-text class="pt-3 pb-0">
            <v-tabs v-model="activeTab" density="comfortable">
              <v-tab prepend-icon="mdi-table" value="table">Table</v-tab>
              <v-tab prepend-icon="mdi-code-json" value="json">JSON</v-tab>
              <v-tab prepend-icon="mdi-text-box-search-outline" value="query">Query</v-tab>
            </v-tabs>
          </v-card-text>

          <v-window v-model="activeTab" class="flex-grow-1 d-flex flex-column">
            <!-- Table View -->
            <v-window-item value="table">
              <v-card-text class="pt-2 flex-grow-1 d-flex flex-column">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="text-caption text-medium-emphasis">
                    {{ tableData.length }} rows • {{ headers.length }} columns
                  </div>
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="search"
                      density="compact"
                      hide-details
                      placeholder="Search"
                      prepend-inner-icon="mdi-magnify"
                      style="max-width: 240px"
                      variant="outlined"
                    />
                    <v-btn
                      class="ml-2"
                      :disabled="tableData.length === 0"
                      prepend-icon="mdi-file-delimited"
                      size="small"
                      variant="text"
                      @click="exportCSV"
                    >CSV</v-btn>
                  </div>
                </div>
                <v-fade-transition mode="out-in">
                  <div :key="chatStore.loading ? 'skeleton' : 'table'" class="flex-grow-1 d-flex flex-column">
                    <v-skeleton-loader v-if="chatStore.loading" class="flex-grow-1" type="table" />
                    <v-data-table
                      v-else
                      class="flex-grow-1"
                      density="comfortable"
                      fixed-header
                      :headers="headers"
                      height="100%"
                      :items="tableData"
                      :items-per-page="10"
                      :no-data-text="noDataText"
                      :search="search"
                    />
                  </div>
                </v-fade-transition>
              </v-card-text>
            </v-window-item>

            <!-- JSON View -->
            <v-window-item value="json">
              <v-card-text>
                <div class="d-flex justify-end mb-2">
                  <v-btn
                    :disabled="tableData.length === 0"
                    prepend-icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    @click="copyJSON"
                  >Copy JSON</v-btn>
                </div>
                <CodeBlock :code="formattedJSON" language="json" />
              </v-card-text>
            </v-window-item>

            <!-- Query View -->
            <v-window-item value="query">
              <v-card-text>
                <div class="text-caption text-medium-emphasis mb-2">Last executed query</div>
                <CodeBlock :code="lastQuery || '—'" language="sql" />
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="chatStore.snackbar" :color="chatStore.snackbarColor" timeout="3000">
      {{ chatStore.snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useChatStore } from '@/stores/chats'

  const chatStore = useChatStore()
  const inputMessage = ref('')
  const tableData = ref([])
  const search = ref('')
  const activeTab = ref('table')
  const lastQuery = ref('')
  const fallbackSuggestions = [
    'Which teams have the lowest readiness this week?',
    'Who are the members most at risk right now?',
    'Show overdue tasks grouped by team.',
    'Which tasks are the biggest bottlenecks currently?',
    'How has overall readiness changed over the past month?',
  ]
  const suggestions = computed(() => chatStore.samples?.length ? chatStore.samples : fallbackSuggestions)

  const headers = computed(() => {
    const first = tableData.value[0]
    if (!first || typeof first !== 'object') return []
    return Object.keys(first).map(k => ({ title: k, key: k }))
  })

  const formattedJSON = computed(() => {
    return tableData.value.length > 0 ? JSON.stringify(tableData.value, null, 2) : '[]'
  })

  const noDataText = computed(() => (chatStore.loading ? 'Loading…' : 'No data'))

  onMounted(() => {
    // Load 5 suggestion samples from the API
    chatStore.fetchSamples()
  })

  async function handleSend () {
    if (!inputMessage.value.trim()) return

    tableData.value = []
    search.value = ''

    try {
      const started = performance.now()
      const response = await chatStore.sendMessage(inputMessage.value)
      if (response && Array.isArray(response.result) && response.result.length > 0) {
        tableData.value = response.result
        lastQuery.value = response.query || ''
        const elapsed = Math.round(performance.now() - started)
        chatStore.showSnackbar(`Query completed in ${elapsed} ms`, 'success')
        activeTab.value = 'table'
      } else {
        chatStore.showSnackbar('No results returned.', 'info')
      }
    } catch (error) {
      console.error('Error running query:', error)
      chatStore.showSnackbar('Error executing query.', 'error')
    }
  }

  function exportJSON () {
    if (tableData.value.length === 0) return

    const jsonStr = JSON.stringify(tableData.value, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'query-results.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  function copyJSON () {
    if (tableData.value.length === 0) return
    navigator.clipboard?.writeText?.(formattedJSON.value)
      .then(() => chatStore.showSnackbar('JSON copied', 'success'))
      .catch(() => chatStore.showSnackbar('Copy failed', 'error'))
  }

  function exportCSV () {
    if (tableData.value.length === 0) return
    const cols = headers.value.map(h => h.key)
    const headerLine = cols.map(c => escapeCSV(c)).join(',')
    const lines = tableData.value.map(row => cols.map(k => escapeCSV(row?.[k])).join(','))
    const csv = [headerLine, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'query-results.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function escapeCSV (val) {
    if (val === null || val === undefined) return ''
    const s = String(val)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }

  function clearAll () {
    tableData.value = []
    inputMessage.value = ''
    search.value = ''
    lastQuery.value = ''
    activeTab.value = 'table'
  }
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.code-block {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  background: rgba(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 12px;
}
</style>
