import {expect,test } from "vitest"
import { sheetSectionToTable, sheetToSections } from "./sheetUtils.server";

test('sheetToSections', () => {
  const sections = sheetToSections([["#id1"], ["a", "b"], [], ["#id2"], ["c", "d"]]);
  expect(sections.length).toBe(2);
  const firstSection = sections[0];
  expect(firstSection.sectionId).toBe("id1");
  expect(firstSection.rows).toHaveLength(1);
  expect(firstSection.rows[0]).toContain("a");
})

test("sheetSectionToTable", () => {
  const table = sheetSectionToTable({hasHeader: false, name: "frames_normal", sheetSection: {
    sectionId: "frames_normal",
    rows: [["a1", "a2"]],
  }});
  expect(table.name).toEqual("frames_normal");
  expect(table.headers).toBeUndefined();
  expect(table.rows).toHaveLength(1);

  const table2 = sheetSectionToTable({hasHeader: true, name: "frames_tenhit", sheetSection: {
    sectionId: "frames_tenhit",
    rows: [["h1", "h2"], ["a1", "a2"]],
  }});
  expect(table2.name).toEqual("frames_tenhit");
  expect(table2.headers).toContain("h1");
  expect(table2.rows).toHaveLength(1);
  expect(table2.rows[0]).toContain("a1");
})