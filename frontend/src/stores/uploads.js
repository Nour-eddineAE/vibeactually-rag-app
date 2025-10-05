export const useUploadStore = defineStore("UploadStore", () => {
  const loading = ref(false);
  const snackbar = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("success");

  function showSnackbar(message, color = "success") {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
  }

  const upload = async (
    url,
    files = [],
    extraFields = {},
    interceptors = {}
  ) => {
    if (!files.length) {
      showSnackbar("No file selected", "error");
      return;
    }

    loading.value = true;

    const formData = new FormData();
    formData.append("file", files[0]); // only one file

    for (const key in extraFields) {
      formData.append(key, extraFields[key]);
    }

    const reqOptions = {
      method: "POST",
      headers: { accept: "application/json" },
      body: formData,
      ...interceptors,
    };

    try {
      const response = await $api.raw(url, reqOptions);
      if (response.status === 200) {
        showSnackbar("File uploaded successfully!", "success");
        return response._data;
      } else {
        showSnackbar("Upload failed.", "error");
        return null;
      }
    } catch (err) {
      console.error("[Upload Error]", err);
      showSnackbar("Error uploading file.", "error");
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    snackbar,
    snackbarMessage,
    snackbarColor,
    showSnackbar,
    upload,
  };
});
