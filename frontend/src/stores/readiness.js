import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReadinessStore = defineStore('ReadinessStore', () => {
  const overallReadiness = ref(0)
  const atRiskTeams = ref([])
  const atRiskMembers = ref([])
  const bottleneckTasks = ref([])
  const loading = ref(false)
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')

  function showSnackbar (message, color = 'success') {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbar.value = true
  }

  const fetchReadiness = async () => {
    loading.value = true

    try {
      const response = await $api.raw('/readiness', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 200 && response._data) {
        setReadinessData(response._data)
      } else {
        showSnackbar('Failed to fetch readiness data', 'error')
      }
    } catch (error) {
      console.error('[ReadinessStore] Error fetching readiness:', error)
      showSnackbar('Error fetching readiness data', 'error')
    } finally {
      loading.value = false
    }
  }

  const setReadinessData = data => {
    overallReadiness.value = data.overallReadiness || 0
    atRiskTeams.value = data.atRiskTeams || []
    atRiskMembers.value = data.atRiskMembers || []
    bottleneckTasks.value = data.bottleneckTasks || []
  }

  return {
    overallReadiness,
    atRiskTeams,
    atRiskMembers,
    bottleneckTasks,
    loading,
    snackbar,
    snackbarMessage,
    snackbarColor,
    fetchReadiness,
    setReadinessData,
    showSnackbar,
  }
})
