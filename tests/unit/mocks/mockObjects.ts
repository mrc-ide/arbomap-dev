export const MOCK_APP_CONFIG = {
    title: "MockApp",
    countries: ["MWI", "TZA"],
    indicators: {
        "FOI": {
            colourScale: { name: "interpolateReds" }
        },
        "p9": {
            colourScale: { name: "interpolateBlues" }
        }
    }
};

export const MOCK_INDICATORS = {
    "123": {
        "FOI": { mean: 0.1, sd: 0.01 }
    }
};

export const MOCK_GEOJSON = {
    features: {
        properties: { shapeID: "321" }
    }
};


