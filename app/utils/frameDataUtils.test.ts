import { expect, test } from "vitest";
import { getTransition } from "./frameDataUtils";

test("getTransitions", () => {
  expect(getTransition("Enter CD -5 +1 +5 with df")).toBe("CD");
  expect(getTransition("enter CD -5 +1 +5 with df")).toBe("CD");
  expect(getTransition("Enter BOK +4c")).toBe("BOK");
  expect(getTransition("* Cancel to FC -16")).toBe("FC");
  expect(getTransition("* Transition to SEN on hit only")).toBe("SEN");
  expect(getTransition("transition to r18 SEN")).toBe("SEN");
})