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
            <i class="mdi mdi-home"></i>
        </a>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { defineProps, defineEmits } from "vue";
import { APP_BASE_ROUTE } from "../router/utils";
import { useAppStore } from "../stores/appStore";
import { routerPush } from "../utils";

const { mapSettings } = storeToRefs(useAppStore());
const router = useRouter();

const props = defineProps({
    selectedIndicator: {
        type: String,
        required: true
    }
});

const emit = defineEmits(["resetView"]);

const resetView = () => {
    const homePath = `/${APP_BASE_ROUTE}/${props.selectedIndicator}`;
    if (mapSettings.value.country) {
        routerPush(router, homePath);
    } else {
        emit("resetView");
    }
};
</script>

<style>
.mdi-home {
    margin-left: -2px;
}
</style>
