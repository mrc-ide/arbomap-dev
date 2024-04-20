<template>
    <div class="page-text">
        <p v-if="appConfig" class="ma-4 text-body-1">
            {{ appConfig.title }} is in development. Check back later for more about the application.
        </p>
    </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const { appConfig } = storeToRefs(useAppStore());
</script>
