export const MOCK_APP_CONFIG = {
    title: "MockApp",
    countries: ["MWI", "TZA"],
    countriesWithoutAdmin2: [],
    geoJsonFeatureProperties: {
        idAdm1: "shapeID",
        idAdm2: "shapeID",
        nameAdm1: "shapeName",
        nameAdm2: "shapeName",
        country: "shapeGroup"
    },
    indicators: {
        FOI: {
            colourScale: { name: "interpolateReds" },
            humanReadableName: "Force of infection",
            unit: ""
        },
        serop9: {
            colourScale: { name: "interpolateBlues" },
            humanReadableName: "Seroprevalence at 9 years of age",
            unit: "%"
        },
        hosp_total: {
            colourScale: { name: "interpolatePurples" },
            humanReadableName: "Hospital admissions",
            shortName: "All ages",
            unit: ""
        },
        hosp_0_4: {
            colourScale: { name: "interpolatePurples" },
            humanReadableName: "Hospital admissions in 0-4 year olds",
            shortName: "0-4",
            unit: ""
        },
        hosp_5_9: {
            colourScale: { name: "interpolatePurples" },
            humanReadableName: "Hospital admissions in 5-9 year olds",
            shortName: "5-9",
            unit: ""
        }
    },
    indicatorGroups: [
        {
            mainIndicator: "FOI"
        },
        {
            mainIndicator: "serop9"
        },
        {
            mainIndicator: "hosp_total",
            subIndicators: ["hosp_0_4", "hosp_5_9"]
        }
    ]
};

export const MOCK_ADMIN0_GEOJSON = {
    features: [{ properties: { shapeID: "456-a", shapeName: "Test456-a", shapeGroup: "TZA" } }]
};

export const MOCK_ADMIN1_GEOJSON = {
    MWI: [{ properties: { shapeID: "123", shapeName: "Test123", shapeGroup: "MWI" } }],
    TZA: [{ properties: { shapeID: "789", shapeName: "Test789", shapeGroup: "TZA" } }]
};

export const MOCK_ADMIN2_GEOJSON = {
    TZA: {
        features: [
            { properties: { shapeID: "789-a", shapeName: "Test789-a", shapeGroup: "TZA" } },
            { properties: { shapeID: "789-b", shapeName: "Test789-b", shapeGroup: "TZA" } }
        ]
    },
    MWI: {
        features: [{ properties: { shapeID: "123-a", shapeName: "Test123-a", shapeGroup: "TZA" } }]
    }
};

export const MOCK_ADMIN1_INDICATORS = {
    MWI: {
        "123": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 }
        }
    },
    TZA: {
        "789": {
            FOI: { mean: 0.3, sd: 0.03 },
            serop9: { mean: 0.4, sd: 0.04 }
        }
    }
};

export const MOCK_ADMIN2_INDICATORS = {
    TZA: {
        "789-a": {
            FOI: { mean: 0.31, sd: 0.031 },
            serop9: { mean: 0.41, sd: 0.041 }
        },
        "789-b": {
            FOI: { mean: 0.32, sd: 0.032 },
            serop9: { mean: 0.42, sd: 0.042 }
        }
    },
    MWI: {
        "123-a": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 }
        }
    }
};

export const MOCK_BOUNDS = {
    GLOBAL: [0, 10, 20, 30],
    MWI: [0, 1, 2, 3],
    TZA: [4, 5, 6, 7]
};
