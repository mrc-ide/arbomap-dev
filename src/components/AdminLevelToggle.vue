<template>
    <v-btn-toggle
        id="admin-toggle"
        :model-value="mapSettings.adminLevel"
        @update:model-value="handleChangeAdminLevel"
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
import { AdminLevel, routerPush } from "../utils";
import { APP_BASE_ROUTE } from "../router/utils";

const router = useRouter();
const { mapSettings, appConfig, mapLoading } = storeToRefs(useAppStore());

const admin2DataMissing = computed(() => appConfig.value.countriesWithoutAdmin2.includes(mapSettings.value.country));

const handleChangeAdminLevel = (level: number) => {
    mapLoading.value = true;
    const { indicator, country } = mapSettings.value;
    const adminLevel = level === 1 ? AdminLevel.ONE : AdminLevel.TWO;
    routerPush(router, `/${APP_BASE_ROUTE}/${indicator}/${country}/${adminLevel}`);
};
</script>
<style scoped>
.selected-button {
    font-weight: 1000;
}
</style>
