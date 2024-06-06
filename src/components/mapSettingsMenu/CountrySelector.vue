<template>
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
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/appStore";
import { APP_BASE_ROUTE } from "../../router/utils";
import { routerPush } from "../../utils";

const router = useRouter();

const { mapSettings, countryNames, mapLoading } = storeToRefs(useAppStore());

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

const handleChangeCountry = (countryCode: string) => {
    if (countryCode === null) {
        // User is probably just trying to clear the input field, not trying to go to a global view
        return;
    }

    mapLoading.value = true;
    const { indicator } = mapSettings.value;

    if (countryCode) {
        routerPush(router, `/${APP_BASE_ROUTE}/${indicator}/${countryCode}`);
    } else {
        routerPush(router, `/${APP_BASE_ROUTE}/${indicator}`);
    }
};
</script>
