<template>
    <v-app>
        <v-app-bar density="compact">
            <router-link to="/">
                <v-app-bar-title class="ml-2">{{ appConfig?.title }}</v-app-bar-title>
            </router-link>
            <v-spacer></v-spacer>
            <v-app-bar-nav-icon aria-label="navigation menu" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" location="right" temporary app>
            <v-list>
                <v-list-item link to="/" prepend-icon="mdi-map-outline">
                    <v-list-item-title>Map</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/about" prepend-icon="mdi-information-outline">
                    <v-list-item-title>About</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/privacy" prepend-icon="mdi-lock-question">
                    <v-list-item-title>Privacy Policy</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/accessibility" prepend-icon="mdi-monitor-eye">
                    <v-list-item-title>Accessibility</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const { initialiseData } = useAppStore();
const { appConfig } = storeToRefs(useAppStore());

const drawer = ref(false);

initialiseData();
watch(appConfig, () => {
    window.document.title = appConfig.value.title;
});
</script>
