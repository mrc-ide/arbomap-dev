import vectorTileLayer from "leaflet-vector-tile-layer";
import {
    LatLngBounds,
    Map,
    Polyline,
    polyline,
    TooltipOptions,
    PathOptions,
    tooltip, LeafletMouseEvent
} from "leaflet";
import { LMap } from "@vue-leaflet/vue-leaflet";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { countryOutlineStyle, minZoom } from "../components/utils";
import { useDataSummary } from "./useDataSummary";
import 'leaflet/dist/leaflet.css';
import { GeoJsonProperties } from "geojson";

type TooltipOptionAndContent = { content: string; options?: TooltipOptions };

export const useLeaflet = (
    style: (f: GeoJsonProperties) => PathOptions,
    getTooltip: (e: LeafletMouseEvent) => TooltipOptionAndContent,
    clickEvent: (e: LeafletMouseEvent) => void
) => {
    // external refs: map related

    const map = shallowRef<typeof LMap | null>(null);
    const featureTooltip = shallowRef<Toolip | null>(null);
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
    const admin1TileLayer = shallowRef<VectorTileLayer | null>(null);
    const admin2TileLayer = shallowRef<VectorTileLayer | null>(null);
    const countryOutlineLayer = shallowRef<VectorTileLayer | null>(null);
    const bounds = ref<LatLngBounds | null>(null);

    // external refs: e2e test related

    const { dataSummary } = useDataSummary(bounds);

    const { appConfig, countryBoundingBoxes, mapSettings, countryProperties } = storeToRefs(useAppStore());
    const featureProperties = appConfig.value.geoJsonFeatureProperties;
    const tileServerUrl = appConfig.value.tileServerUrl;

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

    const closeTooltip = () => {
        if (featureTooltip.value) {
            getLeafletMap().closeTooltip(featureTooltip.value);
        }
    };

    const addTileLayerToMap = (layer: VectorTileLayer, map: Map) => {
        layer.on("click", clickEvent
        ).on("mouseover", (e: LayerMouseEvent) => {
            const content = getTooltip(e);
            closeTooltip(); //close any existing tooltip
            featureTooltip.value = tooltip({ sticky: true, permanent: false })
                .setContent(content)
                .setLatLng(e.latlng)
                .openOn(map);
        }).on("mouseout", () => {
            closeTooltip();
        }).addTo(map);
    }

    const getTileLayerUrl = (adminLevel: number) => `${tileServerUrl}/admin${adminLevel}/{z}/{x}/{-y}`;

    // this is the main function that updates the map, should be called in an appropriate
    // watcher
    const updateLeafletMap = (country: string) => {
        const leafletMap = getLeafletMap();
        if (!leafletMap) return;

        if (!country) {
            countryProperties.value = null;
        }

        resetMaxBoundsAndZoom();

        // please keep addition of empty layer first
        // more info: https://github.com/mrc-ide/arbomap/pull/31#discussion_r1601660916
        if (!leafletMap.hasLayer(emptyLayer.value)) {
            emptyLayer.value.addTo(leafletMap);
        }

        // remove layers from map
        admin1TileLayer.value?.remove();
        admin2TileLayer.value?.remove();
        countryOutlineLayer.value?.remove();

        updateRegionBounds(country);

        const vectorTileOptions = {
            style,
            // rendererFactory: L.canvas.tile, // or L.svg.tile
            interactive: true,
            maxNativeZoom: 10,
            tms: true, // y values are inverted without this!
        }

        admin1TileLayer.value = vectorTileLayer(
            getTileLayerUrl(1),
            vectorTileOptions
        );
        addTileLayerToMap(admin1TileLayer.value, leafletMap);

       if (!!country && mapSettings.value.adminLevel === 2) {
            const admin2Filter = (feature: MapFeature) => {
                return feature.properties[featureProperties.country] === country;
            };

            admin2TileLayer.value = vectorTileLayer(
                getTileLayerUrl(2),
                {...vectorTileOptions, filter: admin2Filter, bounds: [bounds.value.getSouthWest(), bounds.value.getNorthEast()]}
            );
            addTileLayerToMap(admin2TileLayer.value, leafletMap);
        }

        // add country outline if we have a selected country
        if (country) {
            countryOutlineLayer.value = vectorTileLayer(
                getTileLayerUrl(0),{
                ...vectorTileOptions,
                filter: (feature: MapFeature, layerName: string) => {
                    const result = layerName === country;
                    if (result) {
                        // A horrible hack to pull some minimal country metadata from the tile layer for the country and set it in the store
                        // so we can show country name. In the real implementation we would have a geojson properties API
                        // alongside the tile API.
                        countryProperties.value = feature.properties;
                    }
                    return result;
                },
                style: countryOutlineStyle
            });
            countryOutlineLayer.value.addTo(leafletMap);
        } else {
            countryOutlineLayer.value = null;
        }
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
