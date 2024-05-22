<template>
    <v-btn-toggle
        id="admin-toggle"
        :model-value="mapSettings.adminLevel"
        @update:model-value="emit('change-admin-level', $event)"
        mandatory
        :max="1"
        :density="'compact'"
        theme="dark"
    >
        <v-btn :value="1" :ripple="false" selected-class="selected-button">Admin 1</v-btn>
        <v-btn :value="2" :ripple="false" :disabled="admin2DataMissing" selected-class="selected-button">Admin 2</v-btn>
    </v-btn-toggle>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const { mapSettings, appConfig } = storeToRefs(useAppStore());

const admin2DataMissing = computed(() => appConfig.value.countriesWithoutAdmin2.includes(mapSettings.value.country));

const emit = defineEmits(["change-admin-level"]);
</script>
<style scoped>
.selected-button {
    font-weight: bolder;
}
#admin-toggle {
    align-self: flex-end; /* For compatibility with HelpAlert */
}
</style>
