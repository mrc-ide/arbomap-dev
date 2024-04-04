import {mock} from "vitest";
import {AppState} from "../../../src/types/AppState"

export default (state: Partial<AppState>) => {
    mock("@/stores/appStore", () => {
        useAppStore: () => MOCK_APP_STORE
    });
}
