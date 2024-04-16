<template>
    <template v-if="!unknownIndicator && !unknownCountry">
        <Choropleth data-testid="choropleth" />
        <div class="sticky-footer">
            <div v-for="name in indicatorNames" :key="name">
                <router-link :to="`/${name}/${selectedCountryId}`"
                             custom
                             v-slot="{ navigate }">
                    <v-btn
                        @click="navigate"
                        role="link"
                        class="mb-2"
                        :class="name === selectedIndicator ? 'bg-blue' : 'bg-black'"
                        rounded="xl"
                        >{{ name }}
                    </v-btn>
                </router-link>
            </div>
        </div>
    </template>
    <not-found v-else :detail="notFoundDetail"></not-found>
</template>

<script lang="ts" setup>
import router from "../router";
import { storeToRefs } from "pinia";
import {computed, Ref, watch, ref} from "vue";
import { useAppStore } from "../stores/appStore";
import NotFound from "./notFound.vue";

const { appConfig, selectedIndicator, selectedCountryId } = storeToRefs(useAppStore());
const { selectCountry } = useAppStore();

const props = defineProps({
    indicator: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    }
})

const indicatorNames = computed(() => (appConfig.value ? Object.keys(appConfig.value.indicators) : {}));
const unknownCountry:  Ref<boolean> = ref(false);
const unknownIndicator: Ref<boolean> = ref(false);

const notFoundDetail = computed(() => {
    return (unknownIndicator.value ? `Unknown indicator: ${props.indicator}. ` : "") +
        (unknownCountry.value ? `Unknown country ISO: ${props.country}.` : "");
});

const selectDataForRoute = async () => {
    if (!appConfig.value) {
        return;
    }

    if (appConfig.value) {
        if (props.indicator) {
            // Do case-insensitive match to find indicator from route
            const pattern = new RegExp(`^${props.indicator}$`, "i");
            const indicator = Object.keys(appConfig.value.indicators).find(i => pattern.test(i));
            unknownIndicator.value = !indicator;

            const country = props.country ? props.country.toUpperCase() : "";
            unknownCountry.value = country && !appConfig.value.countries.includes(props.country);

            if (!unknownIndicator.value && !unknownCountry.value) {
                selectedIndicator.value = indicator;
                await selectCountry(country);
            }
        } else {
            // No indicator selected on route - default to first indicator and navigate
            router.push(`/${indicatorNames.value[0]}`);
        }
    }
}

watch([appConfig, () => props.indicator, () => props.country], selectDataForRoute);

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
