<template>
    <div v-if="appConfig" class="ma-4 text-body-1">
        <p>
            Sorry, this page does not exist!
        </p>
        <p>
            Go the <router-link to="/">{{ appConfig.title }} home page</router-link> instead.
        </p>
    </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const { appConfig } = storeToRefs(useAppStore());
</script>
