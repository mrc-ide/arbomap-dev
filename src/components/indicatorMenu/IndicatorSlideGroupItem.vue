<template>
    <v-slide-group-item
        :key="indicatorId"
        :value="indicatorId"
    >
        <router-link
            :to="`/${APP_BASE_ROUTE}/${indicatorId}/${selectedCountryId}`"
            custom v-slot="{ navigate }">
            <v-btn
                :class="indicatorId === selectedIndicator ? 'selected-item' : ''"
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
import {APP_BASE_ROUTE} from "../../router/utils";
import {storeToRefs} from "pinia";
import {useAppStore} from "../../stores/appStore";

const props = defineProps({
    indicatorId: {
        type: String
    },
    indicatorName: {
        type: String
    }
});

const { selectedIndicator, selectedCountryId } = storeToRefs(useAppStore());
</script>
