<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig && mapSettings.indicator" role="button" :class="props.isLargeScreen ? 'indicator-menu-activator-desktop' : 'indicator-menu-activator-mobile'">
            <p class="text-wrap">
                {{ appConfig.indicators[mapSettings.indicator].humanReadableName }}
            </p>
            <v-icon :icon="menuOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'" end></v-icon>
            <v-menu
                :class="props.isLargeScreen ? 'indicator-menu-desktop' : 'indicator-menu-mobile'"
                activator="parent"
                v-model="menuOpen"
                :close-on-content-click="false"
                :close-on-back="false"
            >
                <v-list class="bg-transparent opacity-80 elevation-0">
                    <v-list-item
                        class="bg-black mb-2 rounded elevation-4 border-lg"
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
const { appConfig, mapSettings } = storeToRefs(useAppStore());

const props = defineProps({
    isLargeScreen: {
        type: Boolean,
        required: true
    }
})
</script>

<style lang="scss">
.indicator-menu-activator-desktop {
    max-width: calc(100vw - 8rem) !important;
}

// .indicator-menu-desktop {
//     .v-overlay__content {
//         max-width: min(34rem, 80%) !important;
//     }
// }

.indicator-menu-mobile {
    .v-overlay__content {
        left: 0px !important;
    }
}

.indicator-menu-activator-mobile {
    width: 100vw;
    border-radius: 0;
}
</style>
