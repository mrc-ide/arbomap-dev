<template>
    <div style="width: 35rem;">
        <div style="display: flex; justify-content: space-between;">
            <div>{{ admin0GeojsonFeature?.properties["COUNTRY"] || "Global" }}</div>
            <div>
                Admin Toggle
            </div>
        </div>
        <div>
            Indicators
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/appStore';

const { admin0GeojsonFeature } = useAppStore();
</script>
