<template v-if="initialisationComplete">
    <template v-if="!unknownProps.length">
        <template v-if="mapSettings">
            <Choropleth v-if="mapSettings.indicator" data-testid="choropleth" />
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
import { mapSettingsAreEqual, stringAdminLevelToNumeric, AdminLevel } from "../utils";
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
    },
    adminLevel: {
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
        country: appConfig.value.countries,
        adminLevel: Object.keys(stringAdminLevelToNumeric)
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

    const { pathogen, version, indicator, country, adminLevel } = propsWithCorrectCase;
    // we pick dengue, may24 and FOI as defaults for pathogen, version and indicator respectively
    if (!indicator) {
        router.replace(`/${APP_BASE_ROUTE}/${possibleValuesForProps.indicator[0]}`);
        return;
    }
    if (country) {
        const admin2DataMissing = appConfig.value.countriesWithoutAdmin2.includes(country);
        if (!adminLevel) {
            router.replace(
                `/${pathogen}/${version}/${indicator}/${country}/${admin2DataMissing ? AdminLevel.ONE : AdminLevel.TWO}`
            );
            return;
        }
        if (adminLevel === AdminLevel.TWO && admin2DataMissing) {
            router.replace(`/${pathogen}/${version}/${indicator}/${country}/${AdminLevel.ONE}`);
            return;
        }
    }

    const newMapSettings: MapSettings = {
        pathogen,
        version,
        indicator,
        country,
        adminLevel: country ? stringAdminLevelToNumeric[adminLevel] : 1
    };
    if (!mapSettingsAreEqual(mapSettings.value, newMapSettings)) {
        await updateMapSettings(newMapSettings);
    }
};

watch([() => props, initialisationComplete], selectDataForRoute, { deep: true });

onBeforeMount(selectDataForRoute);
</script>
