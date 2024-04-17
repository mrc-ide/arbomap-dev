export const baseUrl = import.meta.env.BASE_URL;

const APP = "dengue";
const VERSION = "may24";
// In future iterations we will support non-default pathogens and data versions, but for now we hardcode these
export const APP_BASE_URL = `${baseUrl}${APP}/${VERSION}`;
