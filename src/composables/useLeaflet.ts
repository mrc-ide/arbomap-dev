import * as L from "leaflet";
const a = L.TileLayer
console.log(typeof a)
import "leaflet.vectorgrid";
import {
    LatLngBounds,
    Map,
    GeoJSON,
    Polyline,
    polyline,
    TooltipOptions,
    PathOptions,
    vectorGrid, LeafletMouseEvent
} from "leaflet";
import { LMap } from "@vue-leaflet/vue-leaflet";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { countryAdmin1OutlineStyle, countryOutlineStyle, minZoom } from "../components/utils";
import { useDataSummary } from "./useDataSummary";
import { MapFeature } from "../types/resourceTypes";

type TooltipOptionAndContent = { content: string; options?: TooltipOptions };

// Need this to prevent "L.DomEvent.fakeStop is not a function" error with canvas mode VectorGrid
//https://stackoverflow.com/questions/73833142/leaflet-vectorgrid-problem-with-click-event
L.DomEvent.fakeStop = function () {
    return true;
}

export const useLeaflet = (
    style: (f: GeoJsonProperties) => PathOptions,
    getTooltip: (e: LeafletMouseEvent) => TooltipOptionAndContent,
    clickEvent: (e: LeafletMouseEvent) => void
) => {
    // external refs: map related

    const map = shallowRef<typeof LMap | null>(null);
    const tooltip = shallowRef<Toolip | null>(null);
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
    const vectorGridLayer = shallowRef<VectorGrid.Slicer | null>(null);
    const countryOutlineLayer = shallowRef<Polyline | null>(null);
    const countryAdmin1OutlineLayer = shallowRef<(Polyline | null)[] | null>(null);
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

    const closeTooltip = () => {
        if (tooltip.value) {
            getLeafletMap().closeTooltip(tooltip.value);
        }
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
        vectorGridLayer.value?.remove();
        countryOutlineLayer.value?.remove();
        countryAdmin1OutlineLayer.value?.forEach((layer) => layer?.remove());

        const geoJsonDocument = {
            type: 'FeatureCollection',
            features: newFeatures
        };

        // TODO: fix up types again - shouldn't really need to use L
        vectorGridLayer.value = vectorGrid.slicer(geoJsonDocument, {
            rendererFactory: L.canvas.tile, // or L.svg.tile
            interactive: true,
            vectorTileLayerStyles: {
                sliced: style
            }
        }).on("click",
            clickEvent
        ).on("mouseover", (e: LayerMouseEvent) => {
            const content = getTooltip(e);
            closeTooltip(); //close any existing tooltip
            tooltip.value =  L.tooltip({ sticky: true, permanent: false})
                .setContent(content)
                .setLatLng(e.latlng)
                .openOn(leafletMap);
        }).on("mouseout", () => {
            closeTooltip();
        }).addTo(leafletMap);

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
