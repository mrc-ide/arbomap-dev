<template>
    <div style="padding-top: 0.75rem">
        <div
            style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                padding-inline: 16px;
            "
        >
            <h3 style="font-weight: 1000">{{ admin0GeojsonFeature?.properties.COUNTRY || "Global" }}</h3>
            <div v-if="mapSettings.country">
                <AdminLevelToggle />
            </div>
        </div>
        <v-divider style="margin-bottom: 1rem; margin-top: 1rem" :thickness="3"></v-divider>
        <div style="padding-inline: 16px">
            <div v-for="(id, index) in indicatorGroupIds" style="margin-top: 1rem; margin-bottom: 1rem" :key="id">
                <v-divider v-if="index !== 0" style="margin-bottom: 1rem" :thickness="2"></v-divider>
                <router-link :to="`/${APP_BASE_ROUTE}/${id}/${mapSettings.country}`" custom v-slot="{ navigate }">
                    <button class="text-left w-100" type="button" @click="navigate">
                        <ColorScaleIcon class="float-left mr-2" :size="24" :indicator="id"></ColorScaleIcon>
                        <v-list-item-title :class="isSelectedIndicator(id, index) ? 'selected-indicator-text' : ''">
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
                    show-arrows="always"
                    :model-value="mapSettings.indicator"
                    @click="slideGroupClicked($event)"
                >
                    <IndicatorSlideGroupItem
                        :indicator-id="id"
                        :indicator-name="appConfig.indicators[appConfig.indicatorGroups[index].mainIndicator].shortName"
                    ></IndicatorSlideGroupItem>
                    <IndicatorSlideGroupItem
                        v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                        :key="subId"
                        :indicator-id="subId"
                        :indicator-name="appConfig.indicators[subId].shortName"
                    ></IndicatorSlideGroupItem>
                </v-slide-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/appStore";
import { APP_BASE_ROUTE } from "../../router/utils";

const { admin0GeojsonFeature, appConfig, mapSettings } = storeToRefs(useAppStore());
const indicatorGroupIds = computed(() => {
    console.log(appConfig.value.indicatorGroups);
    return appConfig.value.indicatorGroups.map((ig) => ig.mainIndicator);
});

const isSelectedIndicator = (indicatorId: string, index: number) => {
    return (
        indicatorId === mapSettings.value.indicator ||
        appConfig.value.indicatorGroups[index].subIndicators?.includes(mapSettings.value.indicator)
    );
};

const slideGroupClicked = (event: PointerEvent) => {
    // stop click on slide controls from closing the menu - only close on button click
    const el = event.target as HTMLElement;
    if (!el.className.includes("v-btn")) {
        event.stopPropagation();
    }
};
</script>

<style>
.selected-indicator-text {
    font-weight: 1000;
}
</style>
