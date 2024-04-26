<template>
    <div class="leaflet-control-zoom leaflet-bar">
        <a
            @click.prevent="resetView"
            class="leaflet-control-zoom-in"
            href="#"
            title="Reset map"
            aria-label="Reset map"
            role="button"
        >
            <vue-feather type="home" size="20" style="margin-top: 4px; margin-right: 1px"></vue-feather>
        </a>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import VueFeather from "vue-feather";
import { defineProps } from "vue";
import { APP_BASE_ROUTE } from "../router/utils";

const props = defineProps({
    selectedIndicator: {
        type: String,
        required: true
    }
});

const router = useRouter();

const resetView = () => {
    let homePath = `/${APP_BASE_ROUTE}/${props.selectedIndicator}`;
    let currentPath = router.currentRoute.value.fullPath;
    homePath = homePath.replace(/\/+$/, "");
    currentPath = currentPath.replace(/\/+$/, "");
    if (currentPath === homePath) {
        // TODO: Do this by zooming out rather than by reloading the page, for performance reasons
        window.location.reload();
    } else {
        router.push(homePath);
    }
};
</script>
