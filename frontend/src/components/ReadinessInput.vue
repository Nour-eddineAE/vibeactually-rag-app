<template>
  <v-container class="pa-5" max-width="600">
    <!-- File Upload Input -->
    <v-file-upload
      :key="inputKey"
      v-model="file"
      clearable
      ref="fileInput"
      show-size
      filter-by-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      label="Select or drop a file"
      @update:modelValue="onFileChange"
      @rejected="onFileRejected"
    >
      <template #item="{ props: itemProps }">
        <v-file-upload-item v-bind="itemProps" lines="one" nav>
          <template #prepend>
            <v-avatar size="32" rounded></v-avatar>
          </template>

          <template #clear="{ props: clearProps }">
            <v-btn
              color="primary"
              v-bind="clearProps"
              size="small"
              icon="mdi-close"
            />
          </template>
        </v-file-upload-item>
      </template>
    </v-file-upload>

    <!-- Upload Button -->
    <div class="d-flex justify-center mt-6">
      <v-btn
        color="primary"
        @click="handleUpload"
        :disabled="!file || uploadStore.loading"
        :loading="uploadStore.loading"
      >
        Upload
      </v-btn>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="uploadStore.snackbar"
      :color="uploadStore.snackbarColor"
      timeout="3000"
      top
    >
      {{ uploadStore.snackbarMessage }}
      <template #actions>
        <v-btn text @click="uploadStore.snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { useUploadStore } from "@/stores/uploads";

const file = ref(null);
const uploadStore = useUploadStore();
const inputKey = ref(0);

function onFileChange(uploadedFile) {
  file.value = uploadedFile;
}

function onFileRejected(uploadedFile) {
  uploadStore.showSnackbar(
    `Unsupported format '${uploadedFile.type}'`,
    "error"
  );
}

function handleUpload() {
  if (!file.value) {
    uploadStore.showSnackbar("No file selected", "error");
    return;
  }
  uploadStore.upload("/upload", [file.value]).then(() => {
    file.value = null;
    inputKey.value++; // forces re-render and resets file input
  });
}
</script>
