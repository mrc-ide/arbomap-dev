<template>
    <v-slide-group-item :key="indicatorId" :value="indicatorId">
        <router-link :to="`/${APP_BASE_ROUTE}/${indicatorId}/${mapSettings.country}`" custom v-slot="{ navigate }">
            <v-btn
                :class="indicatorId === mapSettings.indicator ? 'selected-item selected-slide-group-item' : 'unselected-slide-group-item'"
                size="small"
                class="ma-2"
                rounded
                @click="navigate"
            >
                {{ indicatorName }}
            </v-btn>
        </router-link>
    </v-slide-group-item>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { APP_BASE_ROUTE } from "../../router/utils";
import { useAppStore } from "../../stores/appStore";

defineProps({
    indicatorId: {
        type: String,
        required: true
    },
    indicatorName: {
        type: String,
        required: true
    }
});

const { mapSettings } = storeToRefs(useAppStore());
</script>
<style lang="scss">
.selected-slide-group-item {
    border-width: medium !important;
    font-weight: 800;
}

.unselected-slide-group-item {
    opacity: 0.6;
}
</style>
