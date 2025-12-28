<template>
  <v-container class="py-4 px-4 px-md-6 px-lg-8" fluid>
    <!-- Top: Overview + KPIs -->
    <v-row class="align-stretch">
      <v-col cols="12" md="8">
        <SectionCard
          :badge-color="readiness.color"
          :badge-text="readiness.status"
          content-class="pb-2"
          icon="mdi-shield-check"
          :loading="store.loading"
          title="Overall Readiness"
        >
          <template #header-right>
            <v-btn
              :loading="store.loading"
              prepend-icon="mdi-refresh"
              size="small"
              variant="text"
              @click="refresh"
            >Refresh</v-btn>
          </template>

          <OverviewGauge :color="readiness.color" :loading="store.loading" :value="readiness.percent" />

          <v-row class="mt-1">
            <v-col v-for="k in kpiTiles" :key="k.title" cols="12" md="4">
              <KpiCard v-bind="k" :elevation="0" :loading="store.loading" variant="tonal" />
            </v-col>
          </v-row>
        </SectionCard>
      </v-col>

      <v-col cols="12" md="4">
        <SectionCard
          content-class="flex-grow-1 d-flex align-center"
          icon="mdi-chart-donut"
          :loading="store.loading"
          title="Risk Breakdown"
        >
          <template #header-right>
            <v-chip size="small" variant="tonal">{{ chart.total }} total</v-chip>
          </template>
          <v-fade-transition mode="out-in">
            <div :key="store.loading ? 'skeleton' : 'chart'" class="w-100">
              <v-skeleton-loader v-if="store.loading" class="my-4" height="300" type="image" />
              <DoughnutChart v-else v-bind="chart" />
            </div>
          </v-fade-transition>
        </SectionCard>
      </v-col>
    </v-row>

    <!-- Lists -->
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <EntityList
          color="info"
          empty-text="No teams flagged"
          icon="mdi-account-group-outline"
          :items="store.atRiskTeams"
          :loading="store.loading"
          title="At-Risk Teams"
          value-key="readiness"
        />
      </v-col>
      <v-col cols="12" md="4">
        <EntityList
          color="error"
          empty-text="No members flagged"
          icon="mdi-account-alert-outline"
          :items="store.atRiskMembers"
          :loading="store.loading"
          title="At-Risk Members"
          value-key="readiness"
        />
      </v-col>
      <v-col cols="12" md="4">
        <EntityList
          color="warning"
          empty-text="No bottlenecks detected"
          icon="mdi-progress-alert"
          :items="store.bottleneckTasks"
          :loading="store.loading"
          title="Bottleneck Tasks"
          value-key="readiness"
        />
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="store.snackbar" :color="store.snackbarColor" timeout="2500">
      {{ store.snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="store.snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import { useTheme } from 'vuetify'
  import DoughnutChart from '@/components/DoughnutChart.vue'
  import EntityList from '@/components/EntityList.vue'
  import KpiCard from '@/components/KpiCard.vue'
  import { useReadinessStore } from '@/stores/readiness'
  import { hexToRgba } from '@/utils/colors'

  const store = useReadinessStore()
  const theme = useTheme()

  const readiness = computed(() => {
    const percent = Math.round(store.overallReadiness || 0)
    if (percent >= 80) return { percent, color: 'success', status: 'Good' }
    if (percent >= 50) return { percent, color: 'warning', status: 'Moderate' }
    return { percent, color: 'error', status: 'At Risk' }
  })

  const teamsCount = computed(() => store.atRiskTeams?.length || 0)
  const membersCount = computed(() => store.atRiskMembers?.length || 0)
  const tasksCount = computed(() => store.bottleneckTasks?.length || 0)

  const kpiTiles = computed(() => [
    { title: 'At-Risk Teams', value: teamsCount.value, icon: 'mdi-account-group-outline', color: 'info' },
    { title: 'At-Risk Members', value: membersCount.value, icon: 'mdi-account-alert-outline', color: 'error' },
    { title: 'Bottleneck Tasks', value: tasksCount.value, icon: 'mdi-progress-alert', color: 'warning' },
  ])

  const chart = computed(() => {
    const labels = ['At-Risk Teams', 'At-Risk Members', 'Bottleneck Tasks']
    const values = [teamsCount.value, membersCount.value, tasksCount.value]
    const c = theme.current.value.colors
    const colors = [hexToRgba(c.info), hexToRgba(c.error), hexToRgba(c.warning)]
    const total = values.reduce((a, b) => a + b, 0)
    return { labels, values, colors, total }
  })

  function refresh () {
    store.fetchReadiness()
  }

  onMounted(() => {
    if (!store.loading) store.fetchReadiness()
  })
</script>

<style scoped>
.text-subtitle-1 { font-weight: 600; }
</style>
