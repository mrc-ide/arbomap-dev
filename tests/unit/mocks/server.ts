import { setupServer } from "msw/node";
import { defaultHandlers, handlers } from "./handlers";

export const server = setupServer(...handlers, ...defaultHandlers);
