import {http, HttpHandler, HttpResponse} from "msw";
import {MOCK_APP_CONFIG, MOCK_INDICATORS} from "./mockObjects";

export const handlers: HttpHandler[] = [
    http.get(`resources/config.json`, () =>
        HttpResponse.json(MOCK_APP_CONFIG)
    ),
    http.get(`resources/indicators/indicators-MWI-ADM1.json`, () =>
        HttpResponse.json(MOCK_INDICATORS)
    )
];
