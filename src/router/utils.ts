export const baseUrl = import.meta.env.BASE_URL;

// In future iterations we will support non-default pathogens and data versions, but for now we hardcode these
export const PATHOGEN = "dengue";
export const VERSION = "may24";
export const APP_BASE_ROUTE = `${PATHOGEN}/${VERSION}`;
export const APP_BASE_URL = `${baseUrl}${APP_BASE_ROUTE}`;
