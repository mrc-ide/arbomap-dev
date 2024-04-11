import { http, HttpHandler, HttpResponse } from "msw";
import {
    MOCK_ADMIN1_GEOJSON,
    MOCK_ADMIN1_INDICATORS,
    MOCK_APP_CONFIG,
    MOCK_ADMIN2_INDICATORS,
    MOCK_ADMIN2_GEOJSON
} from "./mockObjects";

export const defaultHandlers = [http.all("*", () => new HttpResponse(null, { status: 200 }))];
export const handlers: HttpHandler[] = [
    http.get("resources/config.json", () => HttpResponse.json(MOCK_APP_CONFIG)),
    http.get("resources/indicators/indicators-MWI-ADM1.json", () => HttpResponse.json(MOCK_ADMIN1_INDICATORS.MWI)),
    http.get("resources/indicators/indicators-TZA-ADM1.json", () => HttpResponse.json(MOCK_ADMIN1_INDICATORS.TZA)),
    http.get("resources/indicators/indicators-TZA-ADM2.json", () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.TZA)),
    http.get("resources/indicators/indicators-MWI-ADM2.json", () => HttpResponse.json(MOCK_ADMIN2_INDICATORS.MWI)),
    http.get("resources/geojson/geoBoundaries-MWI-ADM1_simplified.geojson", () =>
        HttpResponse.json(MOCK_ADMIN1_GEOJSON.MWI)
    ),
    http.get("resources/geojson/geoBoundaries-TZA-ADM1_simplified.geojson", () =>
        HttpResponse.json(MOCK_ADMIN1_GEOJSON.TZA)
    ),
    http.get("resources/geojson/geoBoundaries-TZA-ADM2_simplified.geojson", () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.TZA)
    ),
    http.get("resources/geojson/geoBoundaries-MWI-ADM2_simplified.geojson", () =>
        HttpResponse.json(MOCK_ADMIN2_GEOJSON.MWI)
    )
];
