<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig">
            {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            <v-menu activator="parent">
                <v-list class="opacity-80">
                    <template v-for="(id, index) in indicatorGroupIds" :key="id">
                        <template v-if="appConfig.indicatorGroups[index].subIndicators">
                            <v-btn class="float-right">
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
                            </v-btn>
                        </template>
                        <router-link :to="`/${APP_BASE_ROUTE}/${id}/${selectedCountryId}`" custom v-slot="{ navigate }">
                            <v-list-item
                                :value="id"
                                :title="appConfig.indicators[id].humanReadableName"
                                :subtitle="appConfig.indicators[id].description"
                                :active="id === selectedIndicator"
                                @click="navigate"
                            >
                            </v-list-item>
                        </router-link>
                    </template>
                </v-list>
            </v-menu>
        </v-btn>
    </v-theme-provider>
</template>
<script setup lang="ts">
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {useAppStore} from "../stores/appStore";
import { APP_BASE_ROUTE } from "../router/utils";

const { appConfig, selectedIndicator, selectedCountryId } = storeToRefs(useAppStore());

const indicatorGroupIds = computed(() => appConfig.value.indicatorGroups.map((ig) => ig.mainIndicator));

</script>
