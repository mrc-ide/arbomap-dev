<template>
    <Choropleth data-testid="choropleth" />
    <div class="sticky-footer">
        <div v-for="name in indicatorNames" :key="name">
            <!-- TODO: This link should include selected country if any -->
            <router-link :to="`/${name}`"
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

const { appConfig, selectedIndicator } = storeToRefs(useAppStore());
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
    console.log("calling sdfr")
    console.log(`type of passed indicator is ${typeof props.indicator}`)
    console.log("passed indicator is " + props.indicator)
    if (appConfig.value) {
        if (props.indicator) {
            console.log(`setting si to ${props.indicator}`)
            selectedIndicator.value = props.indicator;
            if (props.country) {
                await selectCountry(props.country.toUpperCase());
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
