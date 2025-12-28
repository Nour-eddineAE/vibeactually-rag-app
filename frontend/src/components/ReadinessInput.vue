<template>
  <v-container class="py-6" max-width="880">
    <v-responsive class="mx-auto" max-width="760">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-upload</v-icon>
          <span class="text-h6">Upload Tasks Spreadsheet</span>
          <v-spacer />
          <v-chip color="info" size="small" variant="tonal">.xlsx</v-chip>
        </v-card-title>
        <v-divider />

        <!-- Helper / guidance -->
        <v-card-text class="pb-2">
          <v-alert
            border="start"
            density="comfortable"
            icon="mdi-information-outline"
            type="info"
            variant="tonal"
          >
            <div class="text-body-2">
              Drag & drop your Excel sheet or browse to select a file.
            </div>
            <div class="text-body-2 mt-1">
              Columns "Name" and "Team" identify people; other columns are
              treated as tasks with due dates.
            </div>
          </v-alert>
        </v-card-text>

        <!-- File Upload Input -->
        <v-card-text>
          <div class="dropzone">
            <v-file-upload
              :key="inputKey"
              ref="fileInput"
              v-model="file"
              clearable
              filter-by-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              label="Select or drop a file (.xlsx)"
              show-size
              @rejected="onFileRejected"
              @update:model-value="onFileChange"
            >
              <template #item="{ props: itemProps }">
                <v-file-upload-item v-bind="itemProps" lines="one" nav>
                  <template #prepend>
                    <v-avatar color="success" rounded size="32" variant="tonal">
                      <v-icon>mdi-file-excel</v-icon>
                    </v-avatar>
                  </template>

                  <template #clear="{ props: clearProps }">
                    <v-btn
                      color="primary"
                      v-bind="clearProps"
                      icon="mdi-close"
                      size="small"
                    />
                  </template>
                </v-file-upload-item>
              </template>
            </v-file-upload>
          </div>
        </v-card-text>

        <!-- Progress indicator -->
        <v-progress-linear
          v-if="tasksStore.loading"
          class="mx-6"
          color="primary"
          height="4"
          indeterminate
          rounded
        />

        <!-- Actions -->
        <v-card-actions class="justify-end">
          <v-btn
            class="mr-2"
            :disabled="!file || tasksStore.loading"
            variant="text"
            @click="reset"
          >
            Reset
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!file || tasksStore.loading"
            :loading="tasksStore.loading"
            @click="handleUpload"
          >
            <v-icon start>mdi-cloud-upload</v-icon>
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Optional: last upload summary -->
      <v-expand-transition>
        <v-card v-if="lastUpload" class="mt-4" color="success" variant="tonal">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            <span>Processed “{{ lastUpload.file }}”</span>
          </v-card-title>
          <v-card-text>
            <div class="text-body-2">
              Inserted {{ lastUpload.summary?.insertedTasks || 0 }} tasks.
            </div>
            <div class="text-caption mt-1">
              Processed: {{ lastUpload.summary?.processed?.teams || 0 }} teams •
              {{ lastUpload.summary?.processed?.members || 0 }} members •
              {{ lastUpload.summary?.processed?.tasks || 0 }} tasks
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </v-responsive>

    <!-- Snackbar -->
    <v-snackbar
      v-model="tasksStore.snackbar"
      :color="tasksStore.snackbarColor"
      timeout="3000"
      top
    >
      {{ tasksStore.snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="tasksStore.snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { useTasksStore } from '@/stores/tasks'

  const file = ref(null)
  const tasksStore = useTasksStore()
  const inputKey = ref(0)
  const lastUpload = ref(null)

  function onFileChange (uploadedFile) {
    file.value = uploadedFile
  }

  function onFileRejected (uploadedFile) {
    tasksStore.showSnackbar(`Unsupported format '${uploadedFile.type}'`, 'error')
  }

  function reset () {
    file.value = null
    inputKey.value++ // forces re-render and resets file input
  }

  function handleUpload () {
    if (!file.value) {
      tasksStore.showSnackbar('No file selected', 'error')
      return
    }
    tasksStore.upload('/tasks/upload', [file.value]).then(data => {
      if (data) {
        lastUpload.value = { file: data.file, summary: data.summary }
      }
      reset()
    })
  }
</script>

<style scoped>
.dropzone {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.dropzone:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
