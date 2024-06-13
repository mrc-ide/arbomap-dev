<template>
    <v-autocomplete
        label="Country"
        :model-value="countrySelection"
        @focus="clearSelection"
        @blur="resetSelection"
        @update:model-value="handleChangeSelection"
        @update:search="handleChangeSearchQuery"
        :items="countryItems"
        :custom-filter="customFilter"
        placeholder="Start typing to find a country"
        no-data-text="No matching countries found"
        variant="solo-filled"
        density="compact"
        :min-width="autocompleteMinWidth"
        single-line
        hide-details
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

// A ref to be used for the v-autocomplete model (which tracks what option is currently selected)
const countrySelection = ref<string | null>(mapSettings.value.country);

// A ref to be used as a copy of the v-autocomplete query (which tracks what has been typed in the input),
// so that we can sort the options in the dropdown.
const searchQuery = ref("");

const globalOption = { title: "Global", value: "" };
const autocompleteMinWidth = 265; // Determined by pixel width of placeholder text

const normalizeCountryName = (name: string) => {
    let normalizedName = name.toLowerCase();

    // Normalize characters used in Réunion, México, and Côte d'Ivoire
    normalizedName = normalizedName.replace("é", "e");
    normalizedName = normalizedName.replace("ô", "o");
    // Remove commas and periods
    normalizedName = normalizedName.replace(/[,./]/g, "");

    return normalizedName;
};

const handleChangeSearchQuery = (query: string) => {
    searchQuery.value = query;
};

const countryItems = computed(() => {
    const items = Object.entries(countryNames.value)
        .sort(([, firstName], [, secondName]) => {
            // Sort by whether the query is a prefix of the country name, so that a search for
            // 'Republic' lists 'Republic of the Congo' before 'Central African Republic'
            const query = normalizeCountryName(searchQuery.value);
            const firstStartsWithQuery = normalizeCountryName(firstName).startsWith(query);
            const secondStartsWithQuery = normalizeCountryName(secondName).startsWith(query);
            if (firstStartsWithQuery && !secondStartsWithQuery) {
                return -1;
            }
            if (!firstStartsWithQuery && secondStartsWithQuery) {
                return 1;
            }
            return 0;
        })
        .map(([code, name]) => ({
            title: name,
            value: code
        }));
    // Show the global option at the top so that it's easy to find
    items.unshift(globalOption);
    return items;
});

const clearSelection = () => {
    // Use null rather than empty string because we generally use empty string to represent the 'global' option
    countrySelection.value = null;
};

const resetSelection = () => {
    // Reset the input to the currently selected country.
    // This avoids having an empty input if the user aborts from selecting.
    countrySelection.value = mapSettings.value.country;
};

// A custom filter that matches on the starts of words, rather than including substrings, so that
// a query 'B' returns countries starting with B, not just countries that contain 'b'.
const customFilter = (itemTitle: string, queryText: string) => {
    if (itemTitle === globalOption.title) {
        // Always show the global option
        return true;
    }

    const itemText = normalizeCountryName(itemTitle);
    const query = normalizeCountryName(queryText);
    if (query.includes(" ") || query.includes("-")) {
        return itemText.includes(query);
    }

    const words = itemText.split(/\s|-/).filter((word) => {
        // Ignore 'functor' words that are unlikely to be what people are querying for
        return !["and", "the", "of"].includes(word);
    });

    // Show the option if any of its words start with the query
    return words.some((word) => word.startsWith(query));
};

const handleChangeSelection = (countryCode: string | null) => {
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

<style lang="scss">
.v-autocomplete {
    .v-input__control,
    .v-field__input,
    .v-field__field {
        min-height: unset;
        height: 36px; // Reduce height from default to match style of admin toggle buttons
    }
    .v-autocomplete__selection {
        padding-bottom: 4px; // Adjust padding to center text vertically
    }
}
</style>
