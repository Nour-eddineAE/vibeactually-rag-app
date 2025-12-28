export const useChatStore = defineStore('ChatStore', () => {
  const loading = ref(false)
  const messages = ref([])
  const samples = ref([])
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')

  function showSnackbar (message, color = 'success') {
    snackbarMessage.value = message
    snackbarColor.value = color
    snackbar.value = true
  }

  const sendMessage = async message => {
    if (!message || !message.trim()) {
      return null
    }

    const trimmedMessage = message.trim()

    messages.value.push({ sender: 'user', text: trimmedMessage })
    loading.value = true

    try {
      const response = await $api.raw('/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage }),
      })

      if (response.status === 200 && response._data) {
        const { query, result } = response._data

        messages.value.push({
          sender: 'bot',
          text: `Query:\n${query}\n\nResult:\n${JSON.stringify(
            result,
            null,
            2,
          )}`,
        })

        return { query, result } // ✅ return the data
      } else {
        showSnackbar('No valid response from server', 'error')
        return null
      }
    } catch (error) {
      console.error('[ChatStore] Error sending message:', error)
      messages.value.push({
        sender: 'bot',
        text: 'Error communicating with server.',
      })
      showSnackbar('Error sending message', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
  }

  const fetchSamples = async () => {
    try {
      const response = await $api.raw('/chat/samples', { method: 'GET' })
      if (response.status === 200 && Array.isArray(response._data?.samples)) {
        // Ensure exactly 5 and strings
        samples.value = response._data.samples
          .map(s => String(s).trim())
          .filter(Boolean)
          .slice(0, 5)
      }
      return samples.value
    } catch (error) {
      console.error('[ChatStore] Error fetching samples:', error)
      showSnackbar('Failed to load suggestions', 'error')
      return []
    }
  }

  return {
    loading,
    messages,
    samples,
    snackbar,
    snackbarMessage,
    snackbarColor,
    showSnackbar,
    sendMessage,
    clearChat,
    fetchSamples,
  }
})
