<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig">
            {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            <v-menu activator="parent">
                <v-list>
                    <template v-for="(id, index) in indicatorGroupIds" :key="id">
                        <template v-if="appConfig.indicatorGroups[index].subIndicators">
                            <v-btn class="float-right">
                                ...
                                <v-menu activator="parent" offset-x>
                                    <v-list>
                                        <v-list-item v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                                                     :key="subId"
                                                     :value="subId"
                                                     :title="appConfig.indicators[subId].humanReadableName"
                                                     :subtitle="appConfig.indicators[subId].description"
                                                     :active="subId === selectedIndicator"
                                        >
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-btn>
                        </template>
                        <v-list-item
                            :value="id"
                            :title="appConfig.indicators[id].humanReadableName"
                            :subtitle="appConfig.indicators[id].description"
                            :active="id === selectedIndicator"
                        >
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
import {useAppStore} from "../stores/appStore";

const { appConfig, selectedIndicator } = storeToRefs(useAppStore());

const indicatorGroupIds = computed(() => appConfig.value.indicatorGroups.map((ig) => ig.mainIndicator));

</script>
