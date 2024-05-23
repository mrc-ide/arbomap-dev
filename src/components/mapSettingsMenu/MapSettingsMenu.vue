<template>
    <menu-activator :is-large-screen="props.isLargeScreen">
        <menu-layout></menu-layout>
    </menu-activator>
</template>

<script setup lang="ts">
const props = defineProps({
    isLargeScreen: {
        type: Boolean,
        required: true
    }
})
</script>
