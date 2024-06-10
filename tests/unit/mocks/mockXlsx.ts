import { vi } from "vitest";

const mockAoaToSheet = vi.fn().mockImplementation((data) => ({ data }));
const mockBookNew = vi.fn().mockImplementation(() => ({ sheets: [] }) as any);
export const mockBookAppendSheet = vi.fn().mockImplementation((workbook: any, worksheet: any, name: string) => {
    (workbook as any).sheets.push({ ...worksheet, name });
});
export const mockWriteFile = vi.fn();

vi.mock("xlsx", () => ({
    writeFile: (data: string, fileName: string) => mockWriteFile(data, fileName),
    utils: {
        aoa_to_sheet: (data: any) => mockAoaToSheet(data),
        book_new: () => mockBookNew(),
        book_append_sheet: (wb: any, ws: any, name: string) => mockBookAppendSheet(wb, ws, name)
    }
}));
