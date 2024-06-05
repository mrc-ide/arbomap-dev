import { render } from "@testing-library/vue";
import MapSettingsMenu from "../../../../src/components/mapSettingsMenu/MapSettingsMenu.vue";

const renderComponent = () => {
    return render(MapSettingsMenu, {
        global: {
            stubs: ["menu-activator"]
        }
    });
};

describe("MapSettingsMenu", () => {
    test("renders as expected on large screen", async () => {
        const { findByTestId } = renderComponent();
        expect(await findByTestId("menu-activator")).toBeVisible();
    });
});
