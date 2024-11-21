import vectorTileLayer from "leaflet-vector-tile-layer";
import {
    LatLngBounds,
    Map,
    GeoJSON,
    Polyline,
    polyline,
    TooltipOptions,
    PathOptions,
    tooltip, LeafletMouseEvent
} from "leaflet";
import { LMap } from "@vue-leaflet/vue-leaflet";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { countryAdmin1OutlineStyle, countryOutlineStyle, minZoom } from "../components/utils";
import { useDataSummary } from "./useDataSummary";
import { MapFeature } from "../types/resourceTypes";
import { APP_BASE_URL } from "../router/utils";
import 'leaflet/dist/leaflet.css';
import { GeoJsonProperties } from "geojson";

type TooltipOptionAndContent = { content: string; options?: TooltipOptions };

// Need this to prevent "L.DomEvent.fakeStop is not a function" error with canvas mode VectorGrid
//https://stackoverflow.com/questions/73833142/leaflet-vectorgrid-problem-with-click-event
//L.DomEvent.fakeStop = function () {
//    return true;
//}

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
    // TODO: fix up this type!
    const admin1TileLayer = shallowRef<VectorTileLayer | null>(null);
    const admin2TileLayer = shallowRef<VectorTileLayer | null>(null);
    const countryOutlineLayer = shallowRef<Polyline | null>(null);
    const bounds = ref<LatLngBounds | null>(null);

    // external refs: e2e test related

    const { dataSummary } = useDataSummary(bounds);

    const { countryBoundingBoxes, admin0GeojsonFeature, mapSettings } = storeToRefs(useAppStore());

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
        admin1TileLayer.value?.remove();
        admin2TileLayer.value?.remove();
        countryOutlineLayer.value?.remove();

        updateRegionBounds(regionId);

        const vectorTileOptions = {
            style,
            // rendererFactory: L.canvas.tile, // or L.svg.tile
            interactive: true,
            maxNativeZoom: 10,
            tms: true, // y values are inverted without this!
        }

        admin1TileLayer.value = vectorTileLayer(
            "http://localhost:5000/admin1/{z}/{x}/{-y}",
            vectorTileOptions
        );
        addTileLayerToMap(admin1TileLayer.value, leafletMap);

        if (!!regionId && mapSettings.value.adminLevel === 2) {
            const admin2Filter = (properties: GeoJsonProperties, layerName: string, zoom: number) => {
                // TODO: actually check COUNTRY property
                return layerName.includes(regionId);
            };

            admin2TileLayer.value = vectorTileLayer(
                "http://localhost:5000/admin2/{z}/{x}/{-y}",
                {...vectorTileOptions, filter: admin2Filter, bounds: [bounds.value.getSouthWest(), bounds.value.getNorthEast()]}
            );
            addTileLayerToMap(admin2TileLayer.value, leafletMap);
        }

        // add country outline if we have a selected country
        console.log(`regionId: ${regionId}`)
        if (regionId) {
            countryOutlineLayer.value = vectorTileLayer(
                "http://localhost:5000/admin0/{z}/{x}/{-y}",{
                ...vectorTileOptions,
                filter: (properties: GeoJsonProperties, layerName: string) => layerName === regionId,
                style: countryOutlineStyle
            });
            countryOutlineLayer.value.addTo(leafletMap);
        } else {
            countryOutlineLayer.value = null;
        }

        // adding country outline if we have a admin0GeojsonFeature
        /*if (admin0GeojsonFeature.value) {
            const latLngs = GeoJSON.coordsToLatLngs(admin0GeojsonFeature.value.geometry.coordinates, 2);
            countryOutlineLayer.value = polyline(latLngs, countryOutlineStyle).addTo(leafletMap);
        } else {
            countryOutlineLayer.value = null;
        }*/

        // add admin 1 outlines if the selected admin level is 2
        /*if (mapSettings.value.adminLevel === 2) {
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
        }*/


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
