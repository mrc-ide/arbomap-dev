import * as L from "leaflet";
const a = L.TileLayer
console.log(typeof a)
import vectorTileLayer from "leaflet-vector-tile-layer";
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
import { APP_BASE_URL } from "../router/utils";
import 'leaflet/dist/leaflet.css';
import * as geojsonvt from "geojson-vt";

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

    const { countryBoundingBoxes, admin0GeojsonFeature, admin1Geojson, admin2Geojson, mapSettings } = storeToRefs(useAppStore());

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

    // MASSIVE HACK!
    // A handy feature, allowing filtering of features on tiles was added to LeafletGrid *after* its last
    // release on npm: https://github.com/Leaflet/Leaflet.VectorGrid/pull/165
    // This is exactly what we need to filter out non-selected country regions from admin2 tile.
    // Here we simply replace the affected method in the tile layer which implements the new filter method,
    // but we really ought to fork the repo as it is no longer being maintained..
    /*const createTile = function(coords, done) {
        var storeFeatures = this.options.getFeatureId;
        var tileSize = this.getTileSize();
        var renderer = this.options.rendererFactory(coords, tileSize, this.options);
        var tileBounds = this._tileCoordsToBounds(coords);
        var vectorTilePromise = this._getVectorTilePromise(coords, tileBounds);
        if (storeFeatures) {
            this._vectorTiles[this._tileCoordsToKey(coords)] = renderer;
            renderer._features = {};
        }
        vectorTilePromise.then( function renderTile(vectorTile) {
            if (vectorTile.layers && vectorTile.layers.length !== 0) {
                for (var layerName in vectorTile.layers) {
                    this._dataLayerNames[layerName] = true;
                    var layer = vectorTile.layers[layerName];

                    var pxPerExtent = this.getTileSize().divideBy(layer.extent);

                    var layerStyle = this.options.vectorTileLayerStyles[ layerName ] ||
                        L.Path.prototype.options;

                    for (var i = 0; i < layer.features.length; i++) {
                        var feat = layer.features[i];
                        var id;

                        if (this.options.filter instanceof Function &&
                            !this.options.filter(feat.properties, coords.z)) {
                            continue;
                        }

                        var styleOptions = layerStyle;
                        if (storeFeatures) {
                            id = this.options.getFeatureId(feat);
                            var styleOverride = this._overriddenStyles[id];
                            if (styleOverride) {
                                if (styleOverride[layerName]) {
                                    styleOptions = styleOverride[layerName];
                                } else {
                                    styleOptions = styleOverride;
                                }
                            }
                        }

                        if (styleOptions instanceof Function) {
                            styleOptions = styleOptions(feat.properties, coords.z);
                        }

                        if (!(styleOptions instanceof Array)) {
                            styleOptions = [styleOptions];
                        }

                        if (!styleOptions.length) {
                            continue;
                        }

                        var featureLayer = this._createLayer(feat, pxPerExtent);

                        for (var j = 0; j < styleOptions.length; j++) {
                            var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);
                            featureLayer.render(renderer, style);
                            renderer._addPath(featureLayer);
                        }

                        if (this.options.interactive) {
                            featureLayer.makeInteractive();
                        }

                        if (storeFeatures) {
                            renderer._features[id] = {
                                layerName: layerName,
                                feature: featureLayer
                            };
                        }
                    }

                }

            }

            if (this._map != null) {
                renderer.addTo(this._map);
            }

            L.Util.requestAnimFrame(done.bind(coords, null, null));
        }.bind(this));
        return renderer.getContainer();
    };*/

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

        const testBounds = getRegionBounds("BRA"); // set bounds on region2 tile layer to only get the tile(s) we need
        const filter = (properties: geojsonvt.Feature, layerName: string, zoom: number) => {
            //console.log(`filtering ${layerName}`)
            // TODO: use selected country to filter
            return layerName.includes("BRA");
        };

        const vectorTileOptions = {
            style,
           // rendererFactory: L.canvas.tile, // or L.svg.tile
            interactive: true,
            maxNativeZoom: 10,
            tms: true, // y values are inverted without this!
            bounds: [testBounds.getSouthWest(), testBounds.getNorthEast()],
            filter
        }

        const testTileUrl = `http://localhost:5000/admin2/{z}/{x}/{-y}`;


        const pbfLayer = vectorTileLayer(testTileUrl,vectorTileOptions);

        pbfLayer.on("click",
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

        //const names = pbfLayer.getDataLayerNames();
        //console.log(`INITIAL NAMES: ${JSON.stringify(names)}`)


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
