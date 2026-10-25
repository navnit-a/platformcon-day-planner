import { expect, test } from "vitest";
import { checkDataPr } from "../scripts/data-scope.mjs";

const TRAINS = "public/data/trains.json";
const LUNCH = "public/data/lunch.json";

const modified = (filename: string) => ({ filename, status: "modified" });

test("accepts the trains file alone", () => {
  expect(checkDataPr("agent-trains", [modified(TRAINS)], "file")).toEqual({ ok: true, path: TRAINS });
});

test("accepts the lunch file when it is first added", () => {
  const files = [{ filename: LUNCH, status: "added" }];
  expect(checkDataPr("agent-lunch", files, "file")).toEqual({ ok: true, path: LUNCH });
});

test("rejects a second file", () => {
  const result = checkDataPr("agent-trains", [modified(TRAINS), modified(LUNCH)], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining(LUNCH) });
});

test("rejects a source file", () => {
  const result = checkDataPr("agent-lunch", [modified("src/App.tsx")], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("src/App.tsx") });
});

test("rejects an unknown agent branch", () => {
  const result = checkDataPr("agent-weather", [modified(TRAINS)], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("agent-weather") });
});

test("rejects a branch named after an object property", () => {
  expect(checkDataPr("constructor", [modified(TRAINS)], "file").ok).toBe(false);
});

test("rejects a rename", () => {
  const files = [{ filename: TRAINS, status: "renamed", previous_filename: "src/App.tsx" }];
  const result = checkDataPr("agent-trains", files, "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("renamed") });
});

test("rejects a previous file name whatever the status says", () => {
  const files = [{ filename: TRAINS, status: "modified", previous_filename: "src/App.tsx" }];
  const result = checkDataPr("agent-trains", files, "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("src/App.tsx") });
});

test("rejects a removed file", () => {
  const result = checkDataPr("agent-lunch", [{ filename: LUNCH, status: "removed" }], "missing");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("removed") });
});

test("rejects a symlink", () => {
  const result = checkDataPr("agent-trains", [modified(TRAINS)], "symlink");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("symlink") });
});

test("rejects a pull request with no files", () => {
  expect(checkDataPr("agent-trains", [], "missing")).toEqual({
    ok: false,
    reason: expect.stringContaining("exactly one file"),
  });
});
