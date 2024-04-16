<template>
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

<script lang="ts" setup>
import router from "../router";

console.log("index")
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { useAppStore } from "../stores/appStore";

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

//console.log(`type of passed indicator is ${typeof props.indicator}`)
//console.log("passed indicator is " + props.indicator)

const indicatorNames = computed(() => (appConfig.value ? Object.keys(appConfig.value.indicators) : {}));

const selectDataForRoute = async () => {
    if (!appConfig.value) {
        return;
    }
    if (appConfig.value) {
        if (props.indicator) {
            console.log(`setting si to ${props.indicator}`)
            if (!Object.keys(appConfig.value.indicators).includes(props.indicator)) {
                // TODO: is there a way to do this more nicely, retaining the route in address bar?
                router.replace("/notFound");
            } else {
                console.log("indicator was found")
                selectedIndicator.value = props.indicator;
                const country = props.country ? props.country.toUpperCase() : "";
                await selectCountry(country);
            }
        } else {
            console.log(`falsy = setting to ${indicatorNames.value[0]}`)
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
