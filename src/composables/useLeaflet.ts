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
    TooltipOptions,
    LeafletEventHandlerFnMap,
    GeoJSONOptions,
    PathOptions,
    TileLayer
} from "leaflet";
import geojsonvt from "geojson-vt";
// Make geojsonvt available to leaflet-geojson-vt
window.geojsonvt = geojsonvt;
import "leaflet-geojson-vt";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { countryAdmin1OutlineStyle, countryOutlineStyle, minZoom } from "../components/utils";
import { useDataSummary } from "./useDataSummary";
import { MapFeature } from "../types/resourceTypes";

type FeatureProperties = { GID_0: string; GID_1: string; NAME_1: string };
type TooltipOptionAndContent = { content: string; options?: TooltipOptions };
// leaflet geojson options do not include smoothFactor, probably outdated
type GeojsonOptions = GeoJSONOptions<FeatureProperties, Geometry> & { smoothFactor: number };

export const useLeaflet = (
    style: (f: MapFeature) => PathOptions,
    getTooltip: (f: MapFeature) => TooltipOptionAndContent,
    layerEvents: (f: MapFeature) => LeafletEventHandlerFnMap
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
    //const geoJsonLayer = shallowRef<GeoJSON<FeatureProperties, Geometry> | null>(null);
    const tileLayer = shallowRef<TileLayer | null>(null);
    const countryOutlineLayer = shallowRef<Polyline | null>(null);
    const countryAdmin1OutlineLayer = shallowRef<(Polyline | null)[] | null>(null);
    const layerWithOpenTooltip = shallowRef<Layer | null>(null);
    const bounds = ref<LatLngBounds | null>(null);

    // external refs: e2e test related

    const { dataSummary } = useDataSummary(bounds);

    const { countryBoundingBoxes, admin0GeojsonFeature, admin1Geojson, mapSettings } = storeToRefs(useAppStore());

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
    // TODO: how to do this with tile layer?
    const configureGeojsonLayer = (feature: MapFeature, layer: Layer) => {
        console.log("configuring")
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
    const updateLeafletMap = (newFeatures: MapFeature[], regionId: string) => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        resetMaxBoundsAndZoom();

        // please keep addition of empty layer first
        // more info: https://github.com/mrc-ide/arbomap/pull/31#discussion_r1601660916
        if (!leafletMap.hasLayer(emptyLayer.value)) {
            emptyLayer.value.addTo(leafletMap);
        }

        // remove layers from map
        //geoJsonLayer.value?.remove();
        tileLayer.value?.remove();
        countryOutlineLayer.value?.remove();
        countryAdmin1OutlineLayer.value?.forEach((layer) => layer?.remove());

        // create new geojson and add to map
        //geoJsonLayer.value = geoJSON<FeatureProperties, Geometry>(newFeatures, {
        //    style,
        //    onEachFeature: configureGeojsonLayer,
        //    smoothFactor: 0
        //} as GeojsonOptions).addTo(leafletMap);

        const options = {
            maxZoom: 16,
            tolerance: 3,
            debug: 0,
            smoothFactor: 0,
            style,
            onEachFeature: configureGeojsonLayer
        };
        const geojson = { type: "FeatureCollection", features: newFeatures };
        tileLayer.value = L.geoJson.vt(geojson, options).addTo(leafletMap);


        // adding country outline if we have a admin0GeojsonFeature
        if (admin0GeojsonFeature.value) {
            const latLngs = GeoJSON.coordsToLatLngs(admin0GeojsonFeature.value.geometry.coordinates, 2);
            countryOutlineLayer.value = polyline(latLngs, countryOutlineStyle).addTo(leafletMap);
        } else {
            countryOutlineLayer.value = null;
        }

        // add admin 1 outlines if the selected admin level is 2
        if (mapSettings.value.adminLevel === 2) {
            const selectedAdmin1Features = admin1Geojson.value[regionId];
            countryAdmin1OutlineLayer.value = selectedAdmin1Features?.map((f) => {
                if (!f?.geometry?.type || !f?.geometry?.coordinates) return null;
                const latLngs = GeoJSON.coordsToLatLngs(
                    f.geometry.coordinates,
                    f.geometry.type === "MultiPolygon" ? 2 : 1 // nesting level
                );
                return polyline(latLngs, countryAdmin1OutlineStyle).addTo(leafletMap);
            });
        } else {
            countryAdmin1OutlineLayer.value = null;
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
