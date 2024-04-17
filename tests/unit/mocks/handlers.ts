import { http, HttpHandler, HttpResponse } from "msw";
import {
    MOCK_ADMIN1_GEOJSON,
    MOCK_ADMIN1_INDICATORS,
    MOCK_APP_CONFIG,
    MOCK_ADMIN2_INDICATORS,
    MOCK_ADMIN2_GEOJSON
} from "./mockObjects";
import {APP_BASE_URL} from "../../../src/router";

export const defaultHandlers = [http.all("*", () => new HttpResponse(null, { status: 200 }))];
const resourcesBase = `${APP_BASE_URL}/resources`;
export const handlers: HttpHandler[] = [
    http.get(`${resourcesBase}/config.json`, () => HttpResponse.json(MOCK_APP_CONFIG)),
    http.get(`${resourcesBase}/indicators/indicators-MWI-ADM1.json`, () => HttpResponse.json(MOCK_ADMIN1_INDICATORS.MWI)),
    http.get(`${resourcesBase}/indicators/indicators-TZA-ADM1.json`, () => HttpResponse.json(MOCK_ADMIN1_INDICATORS.TZA)),
    http.get(`${resourcesBase}/indicators/indicators-TZA-ADM2.json`, () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.TZA)),
    http.get(`${resourcesBase}/indicators/indicators-MWI-ADM2.json`, () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.MWI)),
    http.get(`${resourcesBase}/geojson/geoBoundaries-MWI-ADM1_simplified.geojson`, () =>
        HttpResponse.json(MOCK_ADMIN1_GEOJSON.MWI)
    ),
    http.get(`${resourcesBase}/geojson/geoBoundaries-TZA-ADM1_simplified.geojson`, () =>
        HttpResponse.json(MOCK_ADMIN1_GEOJSON.TZA)
    ),
    http.get(`${resourcesBase}/geojson/geoBoundaries-TZA-ADM2_simplified.geojson`, () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.TZA)
    ),
    http.get(`${resourcesBase}/geojson/geoBoundaries-MWI-ADM2_simplified.geojson`, () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.MWI)
    )
];
