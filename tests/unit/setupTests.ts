import "@testing-library/jest-dom/vitest";
import {server} from "./mocks/server";

beforeAll(() => {
    console.log("listening...")
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
