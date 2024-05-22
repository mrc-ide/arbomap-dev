import { http, HttpHandler, HttpResponse } from "msw";
import {
    MOCK_ADMIN0_GEOJSON,
    MOCK_ADMIN1_GEOJSON,
    MOCK_ADMIN1_INDICATORS,
    MOCK_APP_CONFIG,
    MOCK_ADMIN2_INDICATORS,
    MOCK_ADMIN2_GEOJSON,
    MOCK_BOUNDS
} from "./mockObjects";

export const defaultHandlers = [http.all("*", () => new HttpResponse(null, { status: 200 }))];
const resourcesBase = "/dengue/may24/resources";
export const handlers: HttpHandler[] = [
    http.get(`${resourcesBase}/config.json`, () => HttpResponse.json(MOCK_APP_CONFIG)),
    http.get(`${resourcesBase}/indicators/admin1/global_adm1.json`, () => HttpResponse.json(MOCK_ADMIN1_INDICATORS)),
    http.get(`${resourcesBase}/indicators/admin2/TZA.json`, () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.TZA)),
    http.get(`${resourcesBase}/indicators/admin1/MWI.json`, () => HttpResponse.json(MOCK_ADMIN1_INDICATORS.MWI)),
    http.get(`${resourcesBase}/indicators/admin2/MWI.json`, () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.MWI)),
    http.get(`${resourcesBase}/geojson/all_adm1_0_5pc_by_iso.json`, () => HttpResponse.json(MOCK_ADMIN1_GEOJSON)),
    http.get(`${resourcesBase}/geojson/admin0/gadm41_TZA_0.json`, () => HttpResponse.json(MOCK_ADMIN0_GEOJSON)),
    http.get(`${resourcesBase}/geojson/admin1/gadm41_MWI_1.json`, () => HttpResponse.json(MOCK_ADMIN1_GEOJSON.MWI)),
    http.get(`${resourcesBase}/geojson/admin1/gadm41_TZA_1.json`, () => HttpResponse.json(MOCK_ADMIN1_GEOJSON.TZA)),
    http.get(`${resourcesBase}/geojson/admin2/gadm41_TZA_2_2_5pc.json`, () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.TZA)
    ),
    http.get(`${resourcesBase}/geojson/admin2/gadm41_TZA_2_2_5pc.json`, () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.MWI)
    ),
    http.get(`${resourcesBase}/geojson/adm0_bounds.json`, () => HttpResponse.json(MOCK_BOUNDS))
];
