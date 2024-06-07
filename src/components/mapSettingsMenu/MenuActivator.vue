<template>
    <v-theme-provider theme="dark">
        <v-btn
            v-if="appConfig && mapSettings.indicator"
            role="button"
            :class="props.isLargeScreen ? 'indicator-menu-activator-desktop' : 'indicator-menu-activator-mobile'"
        >
            <p class="text-wrap">
                <div v-if="isGlobal">
                    {{ buttonSummary.indicator }}
                    <activator-vertical-divider />
                    {{ buttonSummary.country }}
                </div>
                <div v-else>
                    {{ buttonSummary.indicator }}
                    <activator-vertical-divider />
                    {{ buttonSummary.country }}
                    <activator-vertical-divider />
                    {{ buttonSummary.adminLevel }}
                </div>
            </p>
            <v-icon :icon="menuOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'" end></v-icon>
            <v-menu
                :class="props.isLargeScreen ? 'indicator-menu-desktop' : 'indicator-menu-mobile'"
                activator="parent"
                v-model="menuOpen"
                :close-on-content-click="false"
                :close-on-back="false"
            >
                <v-list
                    class="bg-transparent opacity-80 elevation-0"
                    :class="isLargeScreen ? 'indicator-menu-list-item-desktop' : 'indicator-menu-list-item-mobile'"
                >
                    <v-list-item
                        class="bg-black rounded elevation-4 indicator-menu-list-item-wrapper"
                        :class="isLargeScreen ? 'border-lg' : ''"
                        :ripple="false"
                    >
                        <slot></slot>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-btn>
    </v-theme-provider>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/appStore";

const menuOpen = ref(false);
const { appConfig, mapSettings, admin0GeojsonFeature } = storeToRefs(useAppStore());

const props = defineProps({
    isLargeScreen: {
        type: Boolean,
        required: true
    }
});

const isGlobal = computed(() => !admin0GeojsonFeature.value?.properties.COUNTRY);

const buttonSummary = computed(() => {
    const country = admin0GeojsonFeature.value?.properties.COUNTRY || "Global";
    const indicator = appConfig.value.indicators[mapSettings.value.indicator].humanReadableName;
    const adminLevel = mapSettings.value.adminLevel === 1 ? "Admin 1" : "Admin 2";
    return { country, indicator, adminLevel };
});
</script>

<style lang="scss">
.indicator-menu-activator-desktop {
    max-width: calc(100vw - 8rem) !important;
}

.indicator-menu-mobile {
    .v-overlay__content {
        left: 0px !important;
        border-radius: 0 !important;
    }
}

.indicator-menu-desktop {
    .v-overlay__content {
        width: 35rem;
    }
}

.indicator-menu-activator-mobile {
    width: 100vw;
    border-radius: 0;
}

.indicator-menu-activator-mobile,
.indicator-menu-activator-desktop {
    height: auto !important;
    padding-block: 10px;
}

.indicator-menu-list-item-mobile .indicator-menu-list-item-wrapper {
    padding-inline: 0px !important;
    border-radius: 0 !important;
}

.indicator-menu-list-item-desktop .indicator-menu-list-item-wrapper {
    padding-inline: 0px !important;
}

.indicator-menu-list-item-mobile {
    padding-bottom: 0 !important;
}
</style>
