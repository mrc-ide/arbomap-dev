import {http, HttpHandler, HttpResponse} from "msw";

export const handlers: HttpHandler[] = [
    http.get(`resources/config.json`, () =>
        HttpResponse.json({
            test: "value"
        })
    ),
    http.all("*", () => new HttpResponse(null, { status: 200 })) // default handler
];
