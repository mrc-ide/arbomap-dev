<template>
  <Choropleth />
  <div class="sticky-footer">
    <div v-for="name in indicatorNames">
      <v-btn link
             class="floating-btn mb-2 "
             :class="name === selectedIndicator ? 'bg-blue' : 'bg-black'"
             rounded="xl"
             @click="selectedIndicator = name">{{ name }}
      </v-btn>
    </div>
    <v-btn @click="genData">gen data</v-btn>
  </div>
</template>

<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {useAppStore} from "../stores/appStore";
  import {computed} from "vue";

  const { appConfig, selectedIndicator } = storeToRefs(useAppStore());
  const {genData} = useAppStore();

  const indicatorNames = computed(() => appConfig.value ?  Object.keys(appConfig.value.indicators) : {});
</script>
<style lang="scss">
.sticky-footer {
  position: fixed;
  bottom: 1rem;
  left: 2rem;
  background-color: rgba(0,0,0,0);
  z-index: 999;
}
</style>
