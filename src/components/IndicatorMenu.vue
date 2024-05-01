<template>
    <v-btn
        color="primary"
    >
        Parent activator

        <v-menu activator="parent">
            <v-list>
                <v-list-item
                    v-for="id in indicatorIds"
                    :key="id"
                    :value="id"
                ><v-list-item-title>{{ appConfig.indicators[id].humanReadableName }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>
</template>
<script setup lang="ts">
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {useAppStore} from "../stores/appStore";

const { appConfig, selectedIndicator } = storeToRefs(useAppStore());

const indicatorIds = computed(() => Object.keys(appConfig.value.indicators));

</script>
