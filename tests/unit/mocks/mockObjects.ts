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
        "FOI": { mean: 0.1, sd: 0.01 },
        "p9": { mean: 0.2, sd: 0.02 }
    }
};

export const MOCK_GEOJSON = {
    features: [
        { properties: { shapeID: "123" } }
    ]
};


export const MOCK_ADMIN1_GEOJSON = {
    "MWI": {
        features: [
            { properties: { shapeID: "123", shapeName: "Test123", shapeGroup: "MWI" } }
        ]
    },
    "TZA": {
        features: [
            { properties: { shapeID: "789", shapeName: "Test789", shapeGroup: "TZA" } }
        ]
    }
};

export const MOCK_ADMIN1_INDICATORS = {
    "MWI": {
        "789": {
            "FOI": { mean: 0.1, sd: 0.01 },
            "p9": { mean: 0.2, sd: 0.02 }
        }
    },
    "TZA": {
        "123": {
            "FOI": { mean: 0.3, sd: 0.03 },
            "p9": { mean: 0.4, sd: 0.04 }
        }
    }

};




