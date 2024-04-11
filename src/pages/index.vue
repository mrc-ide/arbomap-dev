<template>
    <Choropleth data-testid="choropleth" />
    <div class="sticky-footer">
        <div v-for="name in indicatorNames" :key="name">
            <v-btn
                link
                class="mb-2"
                :class="name === selectedIndicator ? 'bg-blue' : 'bg-black'"
                rounded="xl"
                @click="selectedIndicator = name"
                >{{ name }}
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useAppStore } from "../stores/appStore";

const { appConfig, selectedIndicator } = storeToRefs(useAppStore());

const indicatorNames = computed(() => (appConfig.value ? Object.keys(appConfig.value.indicators) : {}));
</script>
<style lang="scss">
.sticky-footer {
    position: fixed;
    bottom: 1rem;
    left: 2rem;
    background-color: rgba(0, 0, 0, 0);
    z-index: 999;
}
</style>
