<template>
    <template v-if="!unknownProps.length">
        <Choropleth v-if="selectedIndicator" data-testid="choropleth" />
        <div class="sticky-footer">
            <IndicatorMenu></IndicatorMenu>
        </div>
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

const router = useRouter();
const { appConfig, selectedIndicator, selectedCountryId, admin1Indicators } = storeToRefs(useAppStore());
const { selectCountry } = useAppStore();

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

const indicatorNames = computed(() => (appConfig.value ? Object.keys(appConfig.value.indicators) : {}));
const unknownProps: Ref<string[]> = ref([]);

const notFoundMsg = (valueType, value) => `Unknown ${valueType}: ${value}.`;

const notFoundDetail = computed(() => {
    return unknownProps.value.map((propName) => notFoundMsg(propName, props[propName])).join(" ");
});

const countryToSelect: Ref<null | string> = ref(null);

const selectDataForRoute = async () => {
    if (!appConfig.value) {
        return;
    }

    const unknown = [];
    const checkRouteProp = (propName: "pathogen" | "version" | "indicator" | "country", candidates: string[]) => {
        if (!props[propName]) {
            return "";
        }

        // Do case-insensitive check against route prop - add to unknown props if not found
        const pattern = new RegExp(`^${props[propName]}$`, "i");
        const result = candidates.find((i) => pattern.test(i));
        if (!result) {
            unknown.push(propName);
        }
        return result;
    };

    checkRouteProp("pathogen", [PATHOGEN]);
    checkRouteProp("version", [VERSION]);
    const indicator = checkRouteProp("indicator", Object.keys(appConfig.value.indicators));
    const country = checkRouteProp("country", appConfig.value.countries);

    unknownProps.value = unknown;

    if (!unknownProps.value.length) {
        if (indicator) {
            selectedIndicator.value = indicator;
            if (country !== selectedCountryId.value) {
                countryToSelect.value = country;
            }
        } else {
            // No indicator selected on route - default to first indicator and navigate
            router.replace(`/${APP_BASE_ROUTE}/${indicatorNames.value[0]}`);
        }
    }
};

watch(
    [appConfig, () => props.pathogen, () => props.version, () => props.indicator, () => props.country],
    selectDataForRoute
);

watch([countryToSelect, admin1Indicators], async () => {
    // wait until admin1 loaded before selecting country
    if (countryToSelect.value !== null && Object.keys(admin1Indicators.value).length) {
        await selectCountry(countryToSelect.value);
        countryToSelect.value = null;
    }
});

selectDataForRoute();
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
