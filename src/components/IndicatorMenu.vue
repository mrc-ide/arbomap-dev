<template>
    <v-theme-provider theme="dark">
        <v-btn v-if="appConfig">
            {{ appConfig.indicators[selectedIndicator].humanReadableName }}
            <v-menu activator="parent">
                <v-list>
                    <v-list-item
                        v-for="id in indicatorGroupIds"
                        :key="id"
                        :value="id"
                        :title="appConfig.indicators[id].humanReadableName"
                        :subtitle="appConfig.indicators[id].description"
                        :active="id === selectedIndicator"
                    >
                    </v-list-item>
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
