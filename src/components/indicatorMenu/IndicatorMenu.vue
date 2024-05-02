<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig && selectedIndicator">
            {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            <v-icon icon="mdi-chevron-up" end></v-icon>
            <v-menu activator="parent">
                <v-list class="bg-transparent opacity-50 elevation-0" style="max-width: 35rem;">
                    <template v-for="(id, index) in indicatorGroupIds" :key="id">
                        <v-list-item
                            class="bg-black mb-2 rounded pa-2"
                            style="opacity: 0.8;"
                            :value="id"
                            :active="id === selectedIndicator"

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

                            <template v-if="appConfig.indicatorGroups[index].subIndicators">
                                <v-slide-group>
                                    <v-slide-group-item
                                        :key="id"
                                    >
                                        <router-link
                                            :to="`/${APP_BASE_ROUTE}/${id}/${selectedCountryId}`"
                                            custom v-slot="{ navigate }">
                                            <v-btn
                                                :class="id === selectedIndicator ? 'bg-grey-darken-2' : 'bg-grey-darken-3'"
                                                size="small"
                                                class="ma-2"
                                                rounded
                                                @click="navigate"
                                            >
                                                {{appConfig.indicatorGroups[index].mainIndicatorAlias}}
                                            </v-btn>
                                        </router-link>
                                    </v-slide-group-item>
                                    <v-slide-group-item
                                        v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                                        :key="subId"
                                        >
                                            <router-link
                                                         :to="`/${APP_BASE_ROUTE}/${subId}/${selectedCountryId}`"
                                                         custom v-slot="{ navigate }">
                                                <v-btn
                                                    :class="subId === selectedIndicator ? 'bg-grey-darken-1' : 'bg-grey-darken-3'"
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
                                <!--<v-btn class="float-right">
                                    ...
                                    <v-menu activator="parent" offset-x>
                                        <v-list class="opacity-80">
                                            <router-link v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                                                :key="subId"
                                                :to="`/${APP_BASE_ROUTE}/${subId}/${selectedCountryId}`"
                                                custom v-slot="{ navigate }">
                                                <v-list-item :value="subId"
                                                             :title="appConfig.indicators[subId].humanReadableName"
                                                             :subtitle="appConfig.indicators[subId].description"
                                                             :active="subId === selectedIndicator"
                                                             @click="navigate"
                                                >
                                                </v-list-item>
                                            </router-link>
                                        </v-list>
                                    </v-menu>
                                </v-btn>-->
                            </template>
                        </v-list-item>
                    </template>
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

</script>
