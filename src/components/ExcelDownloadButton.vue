<template>
    <v-btn id="download-excel-btn" aria-label="Download Excel" class="icon-button" @click="downloadOrOpenDialog()">
        <v-icon>mdi-download</v-icon>
        <v-tooltip location="left" activator="parent">Download Excel</v-tooltip>
    </v-btn>
    <v-dialog v-model="dialogOpen" width="auto">
            <v-card title="Excel Download">
                <v-card-text>
                    Do you want to include Admin 2 region values in the download?
                </v-card-text>
                <template v-slot:actions>
                    <v-card-actions>
                       <v-btn
                            text="Yes"
                            @click="downloadGlobal(true)"
                        ></v-btn>
                        <v-btn
                            text="No"
                            @click="downloadGlobal(true)"
                        ></v-btn>
                        <v-btn
                            text="Cancel"
                            @click="dialogOpen = false"
                        ></v-btn>
                    </v-card-actions>
                </template>
            </v-card>

    </v-dialog>
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
import {storeToRefs} from "pinia";
import {useAppStore} from "../stores/appStore";

const { download, downloadError } = useExcelDownload();
const { mapSettings } = storeToRefs(useAppStore());

const snackbarOpen = ref(false);
const dialogOpen = ref(false);

const downloadOrOpenDialog = () => {
    if (mapSettings.value.country) {
        download();
    } else {
        dialogOpen.value = true;
    }
}

const downloadGlobal = (includeAdmin2) => {
    dialogOpen.value = false;
    download(includeAdmin2);
}

watch(downloadError, () => {
    snackbarOpen.value = !!downloadError.value;
});
</script>

<style lang="scss">
.v-snackbar__wrapper {
    background-color: rgba(255, 255, 255, 1) !important;
}
</style>
