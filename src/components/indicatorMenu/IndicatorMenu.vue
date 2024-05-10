<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig && selectedIndicator" class="indicator-menu-activator">
            <p class="text-wrap">
                {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            </p>
            <v-icon :icon="menuOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'" end></v-icon>
            <v-menu activator="parent" v-model="menuOpen">
                <v-list class="bg-transparent opacity-80 elevation-0" style="max-width: min(35rem, 80%)">
                    <v-list-item
                        v-for="(id, index) in indicatorGroupIds"
                        :key="id"
                        class="bg-black mb-2 rounded pa-2 elevation-4 border-lg"
                        :active="id === selectedIndicator && !appConfig.indicatorGroups[index].subIndicators"
                        :value="id"
                        active-class="selected-item"
                        :ripple="false"
                    >
                        <router-link :to="`/${APP_BASE_ROUTE}/${id}/${selectedCountryId}`" custom v-slot="{ navigate }">
                            <button class="text-left" type="button" @click="navigate">
                                <ColourScaleIcon class="float-left mr-1" :size="24" :indicator="id"></ColourScaleIcon>
                                <v-list-item-title>
                                    {{ appConfig.indicators[id].humanReadableName }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="pt-1">
                                    {{ appConfig.indicators[id].description }}
                                </v-list-item-subtitle>
                            </button>
                        </router-link>
                        <v-slide-group
                            v-if="appConfig.indicatorGroups[index].subIndicators"
                            class="cursor-default"
                            center-active
                            :model-value="selectedIndicator"
                            @click="slideGroupClicked($event)"
                        >
                            <IndicatorSlideGroupItem
                                :indicator-id="id"
                                :indicator-name="
                                    appConfig.indicators[appConfig.indicatorGroups[index].mainIndicator].shortName
                                "
                            ></IndicatorSlideGroupItem>
                            <IndicatorSlideGroupItem
                                v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                                :key="subId"
                                :indicator-id="subId"
                                :indicator-name="appConfig.indicators[subId].shortName"
                            ></IndicatorSlideGroupItem>
                        </v-slide-group>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-btn>
    </v-theme-provider>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/appStore";
import { APP_BASE_ROUTE } from "../../router/utils";

const menuOpen = ref(false);
const { appConfig, selectedIndicator, selectedCountryId } = storeToRefs(useAppStore());

const indicatorGroupIds = computed(() => appConfig.value.indicatorGroups.map((ig) => ig.mainIndicator));

const slideGroupClicked = (event: PointerEvent) => {
    // stop click on slide controls from closing the menu - only close on button click
    const el = event.target as HTMLElement;
    if (!el.className.includes("v-btn")) {
        event.stopPropagation();
    }
};
</script>
<style lang="scss">
.indicator-menu-activator {
    // don't overlap map legend
    max-width: calc(100vw - 8rem) !important;
}

.selected-item {
    border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
