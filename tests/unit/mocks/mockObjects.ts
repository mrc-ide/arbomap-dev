export const MOCK_APP_CONFIG = {
    title: "MockApp",
    countries: ["MWI", "TZA"],
    countriesWithoutAdmin2: [],
    geoJsonFeatureProperties: {
        idAdm0: "shapeGroup",
        idAdm1: "shapeID_1",
        idAdm2: "shapeID_2",
        nameAdm0: "countryName",
        nameAdm1: "shapeName_1",
        nameAdm2: "shapeName_2",
        country: "shapeGroup"
    },
    indicators: {
        FOI: {
            colors: {
                type: "scale",
                colorScale: { name: "interpolateReds" }
            },
            humanReadableName: "Force of infection",
            unit: ""
        },
        serop9: {
            colors: {
                type: "scale",
                colorScale: { name: "interpolateBlues" }
            },
            humanReadableName: "Seroprevalence at 9 years of age",
            unit: "%"
        },
        serop9_class: {
            colors: {
                type: "category",
                categories: [
                    {
                        name: "Under 40%",
                        upperLimit: 40,
                        color: "#dc143c"
                    },
                    {
                        name: "40-60%",
                        upperLimit: 60,
                        color: "#ff5800"
                    },
                    {
                        name: "Above 60%",
                        upperLimit: null,
                        color: "#fcf75e"
                    }
                ]
            },
            humanReadableName: "Seroprevalence classification at age 9 years",
            description: "Proportion of 9 year olds exposed to dengue infection, displayed by classification",
            unit: ""
        },
        hosp_total: {
            colors: {
                type: "scale",
                colorScale: { name: "interpolatePurples" }
            },
            humanReadableName: "Hospital admissions",
            shortName: "All ages",
            unit: ""
        },
        hosp_0_4: {
            colors: {
                type: "scale",
                colorScale: { name: "interpolatePurples" }
            },
            humanReadableName: "Hospital admissions in 0-4 year olds",
            shortName: "0-4",
            unit: ""
        },
        hosp_5_9: {
            colors: {
                type: "scale",
                colorScale: { name: "interpolatePurples" }
            },
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
            mainIndicator: "serop9_class"
        },
        {
            mainIndicator: "hosp_total",
            subIndicators: ["hosp_0_4", "hosp_5_9"]
        }
    ]
};

export const MOCK_COUNTRY_NAMES = {
    MWI: "Malawi",
    TZA: "Tanzania"
};

export const MOCK_ADMIN0_GEOJSON = {
    features: [{ properties: { shapeID: "456-a", shapeName: "Test456-a", shapeGroup: "TZA" } }]
};

export const MOCK_ADMIN1_GEOJSON = {
    MWI: [{ properties: { shapeID_1: "123", shapeName_1: "Test123", shapeGroup: "MWI" } }],
    TZA: [{ properties: { shapeID_1: "789", shapeName_1: "Test789", shapeGroup: "TZA" } }]
};

export const MOCK_ADMIN2_GEOJSON = {
    TZA: {
        features: [
            {
                properties: {
                    shapeID_1: "789",
                    shapeName_1: "Test789",
                    shapeID_2: "789-a",
                    shapeName_2: "Test789-a",
                    shapeGroup: "TZA"
                }
            },
            {
                properties: {
                    shapeID_1: "789",
                    shapeName_1: "Test789",
                    shapeID_2: "789-b",
                    shapeName_2: "Test789-b",
                    shapeGroup: "TZA"
                }
            }
        ]
    },
    MWI: {
        features: [
            {
                properties: {
                    shapeID_1: "123",
                    shapeName_1: "Test123",
                    shapeID_2: "123-a",
                    shapeName_2: "Test123-a",
                    shapeGroup: "TZA"
                }
            }
        ]
    }
};

export const MOCK_ADMIN1_INDICATORS = {
    MWI: {
        "123": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 },
            serop9_class: { mean: 20, sd: 0.02 },
            hosp_total: { mean: 0.3, sd: 0.03 },
            hosp_0_4: { mean: 0.4, sd: 0.04 },
            hosp_5_9: { mean: 0.5, sd: 0.05 }
        }
    },
    TZA: {
        "789": {
            FOI: { mean: 0.3, sd: 0.03 },
            serop9: { mean: 0.4, sd: 0.04 },
            serop9_class: { mean: 40, sd: 0.04 },
            hosp_total: { mean: 0.5, sd: 0.05 },
            hosp_0_4: { mean: 0.6, sd: 0.06 },
            hosp_5_9: { mean: 0.7, sd: 0.07 }
        }
    }
};

export const MOCK_ADMIN2_INDICATORS = {
    TZA: {
        "789-a": {
            FOI: { mean: 0.31, sd: 0.031 },
            serop9: { mean: 0.41, sd: 0.041 },
            serop9_class: { mean: 41, sd: 0.041 },
            hosp_total: { mean: 0.31, sd: 0.031 },
            hosp_0_4: { mean: 0.41, sd: 0.041 },
            hosp_5_9: { mean: 0.51, sd: 0.051 }
        },
        "789-b": {
            FOI: { mean: 0.32, sd: 0.032 },
            serop9: { mean: 0.62, sd: 0.062 },
            serop9_class: { mean: 62, sd: 0.062 },
            hosp_total: { mean: 0.51, sd: 0.051 },
            hosp_0_4: { mean: 0.61, sd: 0.061 },
            hosp_5_9: { mean: 0.71, sd: 0.071 }
        }
    },
    MWI: {
        "123-a": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 },
            serop9_class: { mean: 0.2, sd: 0.02 },
            hosp_total: { mean: 0.53, sd: 0.053 },
            hosp_0_4: { mean: 0.63, sd: 0.063 },
            hosp_5_9: { mean: 0.73, sd: 0.073 }
        }
    }
};

export const MOCK_BOUNDS = {
    GLOBAL: [0, 10, 20, 30],
    MWI: [0, 1, 2, 3],
    TZA: [4, 5, 6, 7]
};
