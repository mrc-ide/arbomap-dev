<template>
    <v-app>
        <v-app-bar density="compact">
            <router-link to="/">
                <v-app-bar-title class="ml-2">{{ appConfig?.title }}</v-app-bar-title>
            </router-link>
            <v-spacer></v-spacer>
            <router-link to="/about">
                <v-btn icon>
                    <v-icon>mdi-information-outline</v-icon>
                    <v-tooltip activator="parent">About</v-tooltip>
                </v-btn>
            </router-link>
        </v-app-bar>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const store = useAppStore();
console.log("store:")
console.log(JSON.stringify(Object.keys(store)))
const { appConfig } = storeToRefs(useAppStore());

store.initialiseData();
watch(appConfig, () => {
    window.document.title = appConfig.value.title;
});
</script>
