import { LMap } from "@vue-leaflet/vue-leaflet";
import { Feature, Geometry } from "geojson";
import {
    LatLngBounds,
    Map,
    geoJSON,
    GeoJSON,
    Polyline,
    Layer,
    polyline,
    StyleFunction,
    TooltipOptions,
    LeafletEventHandlerFnMap,
    GeoJSONOptions
} from "leaflet";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { minZoom } from "../composables/utils";
import { useDataSummary } from "./useDataSummary";

type FeatureProperties = { GID_0: string; GID_1: string; NAME_1: string };
type TooltipOptionAndContent = { content: string; options?: TooltipOptions };
// laeflet geojson options do not include smoothFactor, probably outdated
type GeojsonOptions = GeoJSONOptions<FeatureProperties, Geometry> & { smoothFactor: number };

export const useLeaflet = (
    style: StyleFunction,
    getTooltip: (f: Feature) => TooltipOptionAndContent,
    layerEvents: (f: Feature) => LeafletEventHandlerFnMap
) => {
    // external refs: map related

    const map = shallowRef<typeof LMap | null>(null);
    const getLeafletMap = () => map.value!.leafletObject as Map | undefined;

    // external refs: bounds related

    const bounds = ref<LatLngBounds | null>(null);
    // toggling lockBounds on before updating the leaflet map
    // will lock the minZoom and maxBounds (effectively stops the
    // user from zooming out to the world when they have selected a
    // country or moving around the map to see different countries).

    // This toggle will be switched the false at the end of every map
    // update to make sure the user is not constantly zooming in and being
    // locked to that zoom and view.
    const lockBounds = ref<boolean>(false);

    // external refs: e2e test related

    const { dataSummary } = useDataSummary(bounds);

    // internal refs

    const geoJsonLayer = shallowRef<GeoJSON<FeatureProperties, Geometry>>(geoJSON(undefined));
    const countryOutlineLayer = shallowRef<Polyline | null>(null);
    const layerWithOpenTooltip = shallowRef<Layer | null>(null);

    const { countryBoundingBoxes, admin0GeojsonFeature } = storeToRefs(useAppStore());

    const getRegionBounds = (countryId?: string) => {
        if (Object.keys(countryBoundingBoxes.value).length === 0) return null;
        const [west, east, south, north] = countryBoundingBoxes.value[countryId || "GLOBAL"];
        return new LatLngBounds([south, west], [north, east]);
    };

    const handleMapBoundsUpdated = () => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        if (lockBounds.value) {
            leafletMap.setMaxBounds(leafletMap.getBounds());
            leafletMap.setMinZoom(leafletMap.getZoom());
        }

        lockBounds.value = false;
    };

    const updateRegionBounds = (regionId?: string) => {
        const leafletMap = getLeafletMap();
        const countryBounds = getRegionBounds(regionId);

        if (leafletMap && countryBounds) {
            bounds.value = countryBounds;
            leafletMap.fitBounds(bounds.value);
        }
    };

    const resetMaxBoundsAndZoom = () => {
        const leafletMap = getLeafletMap();
        const globalBounds = getRegionBounds();

        if (leafletMap && globalBounds) {
            leafletMap.setMinZoom(minZoom);
            leafletMap.setMaxBounds(globalBounds);
        }
    };

    const configureGeojsonLayer = (feature: Feature, layer: Layer) => {
        const tooltip = getTooltip(feature);
        layer.bindTooltip(tooltip?.content, tooltip?.options);
        layer.on({
            ...layerEvents(feature),
            tooltipopen: () => {
                // in the past tooltips remained open when you clicked and dragged on the
                // map while the bounds were locked, now we track each layer that will open a
                // tooltip and close them if they are not the most recent layer to make sure
                // no old tooltips remain open
                layerWithOpenTooltip.value?.closeTooltip();
                layerWithOpenTooltip.value = layer;
            }
        });
    };

    const updateLeafletMap = (newFeatures: Feature[], regionId: string) => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        // remove layers from map
        geoJsonLayer.value.remove();
        countryOutlineLayer.value?.remove();

        // create new geojson and add to map
        geoJsonLayer.value = geoJSON<FeatureProperties, Geometry>(newFeatures, {
            style,
            onEachFeature: configureGeojsonLayer,
            smoothFactor: 0
        } as GeojsonOptions).addTo(leafletMap);

        // adding country outline if we have a admin0GeojsonFeature
        // note: the className is just for testing
        if (admin0GeojsonFeature.value) {
            const latLngs = GeoJSON.coordsToLatLngs(admin0GeojsonFeature.value.geometry.coordinates, 2);
            countryOutlineLayer.value = polyline(latLngs, {
                color: "black",
                weight: 1,
                opacity: 0.5,
                className: "country-outline"
            }).addTo(leafletMap);
        }

        updateRegionBounds(regionId);
    };

    return {
        map,
        bounds,
        lockBounds,
        dataSummary,
        updateLeafletMap,
        resetMaxBoundsAndZoom,
        updateRegionBounds,
        handleMapBoundsUpdated
    };
};
