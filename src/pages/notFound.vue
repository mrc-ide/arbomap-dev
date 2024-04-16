<template>
    <div v-if="appConfig" class="ma-4 text-body-1">
        <p>
            Sorry, this page does not exist!
        </p>
        <p v-if="detail">
            {{ detail }}
        </p>
        <p>
            Go the <router-link to="/">{{ appConfig.title }} home page</router-link> instead.
        </p>
    </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

const props = defineProps({
    detail: {
        type: String,
        required: false
    }
});

const { appConfig } = storeToRefs(useAppStore());
</script>
