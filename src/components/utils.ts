export const minZoom = 3;

export const backgroundLayer = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ; " +
        "Boundaries: <a href='https://gadm.org' target='_blank'>GADM</a> version 4.1",
    maxZoom: 10,
    minZoom
};

export const countryOutlineStyle = {
    className: "country-outline",
    color: "black",
    fill: false,
    weight: 1.2,
    opacity: 0.9,
    smoothFactor: 0
};

export const countryAdmin1OutlineStyle = {
    className: "admin-1-outline",
    color: "grey",
    fill: false,
    weight: 0.6,
    smoothFactor: 0
};
