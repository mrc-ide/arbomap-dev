<template v-if="initialisationComplete">
    <template v-if="!unknownProps.length">
        <template v-if="mapSettings">
            <Choropleth v-if="mapSettings.indicator" data-testid="choropleth" />
            <div class="sticky-footer">
                <IndicatorMenu></IndicatorMenu>
            </div>
        </template>
    </template>
    <not-found v-else :detail="notFoundDetail"></not-found>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, Ref, watch, ref } from "vue";
import { routerKey, useRouter } from "vue-router";
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

const unknownProps: Ref<string[]> = ref([]);

const notFoundMsg = (valueType: string, value: string) => `Unknown ${valueType}: ${value}.`;

const notFoundDetail = computed(() => {
    return unknownProps.value.map((propName) => notFoundMsg(propName, props[propName])).join(" ");
});

const checkRouteProp = (propName: PropName, candidates: string[]) => {
    // Do case-insensitive check against route prop
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
    const propsWithCorrectCase: Partial<Record<PropName, string>> = {};
    Object.keys(possibleValuesForProps).forEach((prop: PropName) => {
        const correctCase = checkRouteProp(prop, possibleValuesForProps[prop]);
        if (correctCase === undefined) {
            unknown.push(prop);
            return;
        }
        propsWithCorrectCase[prop] = correctCase;
    });

    unknownProps.value = unknown;
    if (unknownProps.value.length) return;

    // we pick dengue, may24 and FOI as defaults for pathogen, version and indicator respectively
    if (!props.indicator) router.replace(`/${APP_BASE_ROUTE}/${appConfig.value.indicators[0]}`);

    const newMapSettings: MapSettings = {
        pathogen: propsWithCorrectCase.pathogen,
        version: propsWithCorrectCase.version,
        indicator: propsWithCorrectCase.indicator,
        country: propsWithCorrectCase.country,
        adminLevel: propsWithCorrectCase.country ? 2 : 1
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
    top: calc(100dvh - (48px + 1.5rem));
    left: 2rem;
    background-color: rgba(0, 0, 0, 0);
    z-index: 999;
}
</style>
