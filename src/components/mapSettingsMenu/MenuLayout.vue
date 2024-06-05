<template>
    <div class="menu-container">
        <div class="country-name-and-admin-toggle-container px-4">
            <v-autocomplete
                label="Country"
                :model-value="mapSettings.country"
                @update:model-value="handleChangeCountry"
                :items="countryItems"
                :custom-filter="customFilter"
                placeholder="Start typing to filter"
                no-data-text="No matching countries found"
                variant="solo-filled"
                density="compact"
                single-line
                hide-details
                clearable
                auto-select-first
            ></v-autocomplete>
            <div v-if="mapSettings.country">
                <AdminLevelToggle />
            </div>
        </div>
        <v-divider class="menu-divider" :thickness="3"></v-divider>
        <div class="px-4">
            <div v-for="(id, index) in indicatorGroupIds" :key="id">
                <v-divider v-if="index !== 0" class="menu-divider" :thickness="2"></v-divider>
                <router-link :to="`/${APP_BASE_ROUTE}/${id}/${mapSettings.country}`" custom v-slot="{ navigate }">
                    <button class="text-left w-100 indicator-button" type="button" @click="navigate">
                        <ColorScaleIcon
                            class="float-left mr-2"
                            :size="24"
                            :indicator="id"
                            :class="isSelectedIndicator(id, index) ? '' : 'unselected-color-icon'"
                        ></ColorScaleIcon>
                        <v-list-item-title :class="isSelectedIndicator(id, index) ? 'max-bold-text' : ''">
                            {{ appConfig.indicators[id].humanReadableName }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="pt-1">
                            {{ appConfig.indicators[id].description }}
                        </v-list-item-subtitle>
                    </button>
                </router-link>
                <v-slide-group
                    v-if="appConfig.indicatorGroups[index].subIndicators"
                    class="cursor-default"
                    center-active
                    show-arrows="always"
                    :model-value="mapSettings.indicator"
                    @click="slideGroupClicked($event)"
                >
                    <IndicatorSlideGroupItem
                        :indicator-id="id"
                        :indicator-name="appConfig.indicators[appConfig.indicatorGroups[index].mainIndicator].shortName"
                    ></IndicatorSlideGroupItem>
                    <IndicatorSlideGroupItem
                        v-for="subId in appConfig.indicatorGroups[index].subIndicators"
                        :key="subId"
                        :indicator-id="subId"
                        :indicator-name="appConfig.indicators[subId].shortName"
                    ></IndicatorSlideGroupItem>
                </v-slide-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/appStore";
import { APP_BASE_ROUTE } from "../../router/utils";
import { routerPush, AdminLevel } from "../../utils";

const router = useRouter();

const { appConfig, mapSettings, countryNames, mapLoading } = storeToRefs(useAppStore());
const indicatorGroupIds = computed(() => appConfig.value.indicatorGroups.map((ig) => ig.mainIndicator));

const countryItems = computed(() => {
    const items = Object.entries(countryNames.value).map(([code, name]) => ({
        title: name,
        value: code
    }));
    items.unshift({ title: "Global", value: "" });
    return items;
});

// A custom filter that matches on the starts of words, rather than including substrings, so that
// a query 'B' returns countries starting with B, not just countries that contain 'b'.
const customFilter = (itemTitle: string, queryText: string) => {
    const itemText = itemTitle.toLowerCase();
    const query = queryText.toLowerCase();
    if (query.includes(" ")) {
        return itemText.includes(query);
    }

    const words = itemText.split(" ").filter((word) => {
        // Ignore 'functor' words that are unlikely to be what people are querying for
        return !["and", "the", "of"].includes(word);
    });
    return words.some((word) => word.startsWith(query));
};

const isSelectedIndicator = (indicatorId: string, index: number) => {
    return (
        indicatorId === mapSettings.value.indicator ||
        appConfig.value.indicatorGroups[index].subIndicators?.includes(mapSettings.value.indicator)
    );
};

const slideGroupClicked = (event: PointerEvent) => {
    // stop click on slide controls from closing the menu - only close on button click
    const el = event.target as HTMLElement;
    if (!el.className.includes("v-btn")) {
        event.stopPropagation();
    }
};

const handleChangeCountry = (countryCode: string) => {
    if (countryCode === null) {
        // User is probably just trying to clear the input field, not to go to a global view
        return;
    }

    mapLoading.value = true;
    const { indicator, adminLevel } = mapSettings.value;

    if (countryCode) {
        const level = adminLevel === 1 ? AdminLevel.ONE : AdminLevel.TWO;
        routerPush(router, `/${APP_BASE_ROUTE}/${indicator}/${countryCode}/${level}`);
    } else {
        routerPush(router, `/${APP_BASE_ROUTE}/${indicator}`);
    }
};
</script>

<style>
.max-bold-text {
    font-weight: 1000;
}

.unselected-color-icon {
    opacity: 0.6;
}

.menu-container {
    padding-block: 0.75rem;
}

.country-name-and-admin-toggle-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    width: 100%;
}

.menu-divider {
    margin-block: 1rem;
}
</style>
