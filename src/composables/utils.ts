export const minZoom = 3;

export const backgroundLayer = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ; " +
        "Boundaries: <a href='https://gadm.org' target='_blank'>GADM</a> version 4.1",
    maxZoom: 10,
    minZoom
};
