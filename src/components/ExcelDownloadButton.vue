<template>
    <v-btn id="download-excel-btn" aria-label="Download Excel" class="icon-button" density="compact" @click="download()">
        <v-icon>mdi-download</v-icon>
        <v-tooltip location="left" activator="parent">Download Excel</v-tooltip>
    </v-btn>
    <v-snackbar v-model="snackbarOpen" variant="outlined" color="error">
        Error downloading Excel file: {{ downloadError.message || downloadError.toString() }}
        <template v-slot:actions>
            <v-btn icon @click="snackbarOpen = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useExcelDownload } from "../composables/useExcelDownload";

const { download, downloadError } = useExcelDownload();

const snackbarOpen = ref(false);

watch(downloadError, () => {
    snackbarOpen.value = !!downloadError.value;
});
</script>

<style lang="scss">
.v-snackbar__wrapper {
    background-color: rgba(255, 255, 255, 1) !important;
}
</style>
