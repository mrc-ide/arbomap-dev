<template v-if="initialisationComplete">
    <template v-if="!unknownProps.length">
        <template v-if="mapSettings">
            <Choropleth v-if="mapSettings.indicator" data-testid="choropleth" />
            <div class="sticky-footer">
                <div v-for="name in indicatorNames" :key="name">
                    <router-link :to="`/${APP_BASE_ROUTE}/${name}/${mapSettings.country}`" custom v-slot="{ navigate }">
                        <v-btn
                            @click="navigate"
                            role="link"
                            class="mb-2"
                            :class="name === mapSettings.indicator ? 'bg-blue' : 'bg-black'"
                            rounded="xl"
                            >{{ name }}
                        </v-btn>
                    </router-link>
                </div>
            </div>
        </template>
    </template>
    <not-found v-else :detail="notFoundDetail"></not-found>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, Ref, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import NotFound from "./notFound.vue";
import { APP_BASE_ROUTE, PATHOGEN, VERSION } from "../router/utils";
import { mapSettingsAreEqual } from "../utils";
import { MapSettings } from "../types/resourceTypes";

const router = useRouter();
const { appConfig, mapSettings, initialisationComplete } = storeToRefs(useAppStore());
const { updateMapSettings } = useAppStore();

const props = defineProps({
    pathogen: {
        type: String,
        required: false,
        default: ""
    },
    version: {
        type: String,
        required: false,
        default: ""
    },
    indicator: {
        type: String,
        required: false,
        default: ""
    },
    country: {
        type: String,
        required: false,
        default: ""
    }
});
type PropName = keyof typeof props;

const indicatorNames = computed(() => (appConfig.value ? Object.keys(appConfig.value.indicators) : {}));
const unknownProps: Ref<string[]> = ref([]);

const notFoundMsg = (valueType: string, value: string) => `Unknown ${valueType}: ${value}.`;

const notFoundDetail = computed(() => {
    return unknownProps.value.map((propName) => notFoundMsg(propName, props[propName])).join(" ");
});

const checkRouteProp = (propName: PropName, candidates: string[]) => {
    // Do case-insensitive check against route prop - add to unknown props if not found
    if (props[propName] === "") return "";
    const pattern = new RegExp(`^${props[propName]}$`, "i");
    return candidates.find((i) => pattern.test(i));
};

const selectDataForRoute = async () => {
    if (!appConfig.value) return;

    const unknown = [];
    const possibleValuesForProps: Record<PropName, string[]> = {
        pathogen: [PATHOGEN],
        version: [VERSION],
        indicator: Object.keys(appConfig.value.indicators),
        country: appConfig.value.countries
    };
    Object.keys(possibleValuesForProps).forEach((prop: PropName) => {
        if (checkRouteProp(prop, possibleValuesForProps[prop]) === undefined) {
            unknown.push(prop);
        }
    });

    unknownProps.value = unknown;
    if (unknownProps.value.length) return;

    let path = "";
    path += `/${props.pathogen || PATHOGEN}`;
    path += `/${props.version || VERSION}`;
    path += `/${props.indicator || indicatorNames.value[0]}`;
    const currentPath = router.currentRoute.value.path;
    if (currentPath.indexOf(path) !== 0) {
        router.replace(path);
    }

    const newMapSettings: MapSettings = {
        pathogen: checkRouteProp("pathogen", possibleValuesForProps["pathogen"]),
        version: checkRouteProp("version", possibleValuesForProps["version"]),
        indicator: checkRouteProp("indicator", possibleValuesForProps["indicator"]),
        country: checkRouteProp("country", possibleValuesForProps["country"]),
        adminLevel: props.country ? 2 : 1
    };
    if (!mapSettingsAreEqual(mapSettings.value, newMapSettings)) {
        await updateMapSettings(newMapSettings);
    }
};

watch([() => props, initialisationComplete], selectDataForRoute, { deep: true });

onBeforeMount(selectDataForRoute);
</script>
<style lang="scss">
.sticky-footer {
    position: fixed;
    bottom: 1rem;
    left: 2rem;
    background-color: rgba(0, 0, 0, 0);
    z-index: 999;
}
</style>
