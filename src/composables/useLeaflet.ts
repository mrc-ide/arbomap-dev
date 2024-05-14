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
import { minZoom } from "../components/utils";
import { useDataSummary } from "./useDataSummary";

type FeatureProperties = { GID_0: string; GID_1: string; NAME_1: string };
type TooltipOptionAndContent = { content: string; options?: TooltipOptions };
// leaflet geojson options do not include smoothFactor, probably outdated
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

    // toggling lockBounds on before updating the leaflet map
    // will lock the minZoom and maxBounds (effectively stops the
    // user from zooming out to the world when they have selected a
    // country or moving around the map to see different countries).

    // This toggle will be switched to false at the end of every map
    // update to make sure the user is not constantly zooming in and being
    // locked to that zoom and view.
    const lockBounds = ref<boolean>(false);

    // internal refs

    const emptyLayer = shallowRef<Polyline>(polyline([]));
    const geoJsonLayer = shallowRef<GeoJSON<FeatureProperties, Geometry> | null>(null);
    const countryOutlineLayer = shallowRef<Polyline | null>(null);
    const layerWithOpenTooltip = shallowRef<Layer | null>(null);
    const bounds = ref<LatLngBounds | null>(null);

    // external refs: e2e test related

    const { dataSummary } = useDataSummary(bounds);

    const { countryBoundingBoxes, admin0GeojsonFeature } = storeToRefs(useAppStore());

    const getRegionBounds = (countryId?: string) => {
        if (Object.keys(countryBoundingBoxes.value).length === 0) return null;
        const [west, east, south, north] = countryBoundingBoxes.value[countryId || "GLOBAL"];
        return new LatLngBounds([south, west], [north, east]);
    };

    // this is the last function we trigger when the map is updated. we trigger this
    // to make sure we lock the current bounds if necessary and turn the lockBounds
    // toggle off so we don't keep locking the bounds
    const handleMapBoundsUpdated = () => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        if (lockBounds.value) {
            leafletMap.setMaxBounds(leafletMap.getBounds());
            leafletMap.setMinZoom(leafletMap.getZoom());
        }

        lockBounds.value = false;
    };

    // we trigger this at the end of update map, after all the layers
    // are added to the map to set the view and zoom of the map
    const updateRegionBounds = (regionId?: string) => {
        const leafletMap = getLeafletMap();
        const regionBounds = getRegionBounds(regionId);

        if (leafletMap && regionBounds) {
            bounds.value = regionBounds;
            leafletMap.fitBounds(bounds.value);
        }
    };

    // this is called at the start of any map update because if a user
    // wants to go back to world view from a country view then we need
    // to zoom out which is not possible if we have locked the zoom and
    // country bounds
    const resetMaxBoundsAndZoom = () => {
        const leafletMap = getLeafletMap();
        const globalBounds = getRegionBounds();

        if (leafletMap && globalBounds) {
            leafletMap.setMinZoom(minZoom);
            leafletMap.setMaxBounds(globalBounds);
        }
    };

    // this is run for every single feature that we display, we can attach
    // tooltips and any events to our features, the user of useLeaflet can
    // attach events to features via layerEvents
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
                if (layer !== layerWithOpenTooltip.value) {
                    layerWithOpenTooltip.value?.closeTooltip();
                    layerWithOpenTooltip.value = layer;
                }
            }
        });
    };

    // this is the main function that updates the map, should be called in an appropriate
    // watcher
    const updateLeafletMap = (newFeatures: Feature[], regionId: string) => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        resetMaxBoundsAndZoom();

        // please keep addition of empty layer first
        // more info: https://github.com/mrc-ide/arbomap/pull/31#issuecomment-2110480157
        if (!leafletMap.hasLayer(emptyLayer.value)) {
            emptyLayer.value.addTo(leafletMap);
        }

        // remove layers from map
        geoJsonLayer.value?.remove();
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
        } else {
            countryOutlineLayer.value = null;
        }

        updateRegionBounds(regionId);
    };

    return {
        map,
        lockBounds,
        dataSummary,
        updateLeafletMap,
        updateRegionBounds,
        handleMapBoundsUpdated
    };
};
