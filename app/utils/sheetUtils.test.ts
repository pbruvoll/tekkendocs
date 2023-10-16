import { sheetSectionToTable, sheetToSections } from "./sheetUtils.server";
import {test, expect } from "vitest"

test('sheetToSections', () => {
  const sections = sheetToSections([["#id1"], ["a", "b"], [], ["#id2"], ["c", "d"]]);
  expect(sections.length).toBe(2);
  const firstSection = sections[0];
  expect(firstSection.sectionId).toBe("id1");
  expect(firstSection.rows).toHaveLength(1);
  expect(firstSection.rows[0]).toContain("a");
})

test("sheetSectionToTable", () => {
  const table = sheetSectionToTable({hasHeader: false, name: "MyTable", sheetSection: {
    sectionId: "dummy",
    rows: [["a1", "a2"]],
  }});
  expect(table.name).toEqual("MyTable");
  expect(table.headers).toBeUndefined();
  expect(table.rows).toHaveLength(1);

  const table2 = sheetSectionToTable({hasHeader: true, name: "MyTable2", sheetSection: {
    sectionId: "dummy",
    rows: [["h1", "h2"], ["a1", "a2"]],
  }});
  expect(table2.name).toEqual("MyTable2");
  expect(table2.headers).toContain("h1");
  expect(table2.rows).toHaveLength(1);
  expect(table2.rows[0]).toContain("a1");
})