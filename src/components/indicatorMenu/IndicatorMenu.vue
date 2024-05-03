<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig && selectedIndicator" style="max-width: 80vw;">
            <p class="text-wrap">
            {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            </p>
            <v-icon icon="mdi-chevron-up" end></v-icon>
            <v-menu activator="parent">
                <v-list class="bg-transparent opacity-70 elevation-0" style="max-width: min(35rem, 80%);">
                    <v-list-item
                        v-for="(id, index) in indicatorGroupIds"
                        :key="id"
                        class="bg-black mb-2 rounded pa-2 elevation-4"
                        :value="id"
                        :active="id === selectedIndicator && !appConfig.indicatorGroups[index].subIndicators"
                        active-class="bg-grey-darken-4"
                    >
                        <router-link :to="`/${APP_BASE_ROUTE}/${id}/${selectedCountryId}`" custom v-slot="{ navigate }">
                                <div @click="navigate">
                                    <ColourScaleIcon class="float-left mr-1" size="24" :indicator="id"></ColourScaleIcon>
                                    <v-list-item-title>
                                        {{appConfig.indicators[id].humanReadableName}}
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="pt-1">
                                        {{appConfig.indicators[id].description}}
                                    </v-list-item-subtitle>
                                </div>
                        </router-link>
                        <v-slide-group
                            v-if="appConfig.indicatorGroups[index].subIndicators"
                            class="cursor-default"
                            center-active
                            :model-value="selectedIndicator"
                            @click="slideGroupClicked($event)"
                        >
                            <v-slide-group-item
                                :key="id"
                                :value="id"
                            >
                                <router-link
                                    :to="`/${APP_BASE_ROUTE}/${id}/${selectedCountryId}`"
                                    custom v-slot="{ navigate }">
                                    <v-btn
                                        :class="id === selectedIndicator ? 'bg-grey-darken-1' : 'bg-grey-darken-4'"
                                        size="small"
                                        class="ma-2"
                                        rounded
                                        @click="navigate"
                                    >
                                        {{appConfig.indicators[appConfig.indicatorGroups[index].mainIndicator].shortName}}
                                    </v-btn>
                                </router-link>
                            </v-slide-group-item>
                            <v-slide-group-item
                                v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                                :key="subId"
                                :value="subId"
                             >
                                <router-link
                                             :to="`/${APP_BASE_ROUTE}/${subId}/${selectedCountryId}`"
                                             custom v-slot="{ navigate }">
                                    <v-btn
                                        :class="subId === selectedIndicator ? 'bg-grey-darken-1' : 'bg-grey-darken-4'"
                                        size="small"
                                        class="ma-2"
                                        rounded
                                        @click="navigate"
                                    >
                                        {{appConfig.indicators[subId].shortName}}
                                    </v-btn>
                                </router-link>
                            </v-slide-group-item>
                        </v-slide-group>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-btn>
    </v-theme-provider>
</template>
<script setup lang="ts">
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {useAppStore} from "../../stores/appStore";
import { APP_BASE_ROUTE } from "../../router/utils";

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
