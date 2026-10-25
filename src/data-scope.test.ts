import { expect, test } from "vitest";
import { checkDataPr, report } from "../scripts/data-scope.mjs";

const TRAINS = "public/data/trains.json";
const LUNCH = "public/data/lunch.json";

const modified = (filename: string) => ({ filename, status: "modified" });

test("accepts the trains file alone", () => {
  expect(checkDataPr("agent-trains", "main", [modified(TRAINS)], "file")).toEqual({
    ok: true,
    path: TRAINS,
  });
});

test("accepts the lunch file when it is first added", () => {
  const files = [{ filename: LUNCH, status: "added" }];
  expect(checkDataPr("agent-lunch", "main", files, "file")).toEqual({ ok: true, path: LUNCH });
});

test("rejects a pull request into another branch", () => {
  const result = checkDataPr("agent-trains", "card-12", [modified(TRAINS)], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("card-12") });
});

test("rejects a pull request with no base branch", () => {
  expect(checkDataPr("agent-trains", "", [modified(TRAINS)], "file").ok).toBe(false);
});

test("rejects a second file", () => {
  const result = checkDataPr("agent-trains", "main", [modified(TRAINS), modified(LUNCH)], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining(LUNCH) });
});

test("rejects a source file", () => {
  const result = checkDataPr("agent-lunch", "main", [modified("src/App.tsx")], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("src/App.tsx") });
});

test("rejects an unknown agent branch", () => {
  const result = checkDataPr("agent-weather", "main", [modified(TRAINS)], "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("agent-weather") });
});

test("rejects a branch named after an object property", () => {
  expect(checkDataPr("constructor", "main", [modified(TRAINS)], "file").ok).toBe(false);
});

test("rejects a rename", () => {
  const files = [{ filename: TRAINS, status: "renamed", previous_filename: "src/App.tsx" }];
  const result = checkDataPr("agent-trains", "main", files, "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("renamed") });
});

test("rejects a previous file name whatever the status says", () => {
  const files = [{ filename: TRAINS, status: "modified", previous_filename: "src/App.tsx" }];
  const result = checkDataPr("agent-trains", "main", files, "file");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("src/App.tsx") });
});

test("rejects a removed file", () => {
  const files = [{ filename: LUNCH, status: "removed" }];
  const result = checkDataPr("agent-lunch", "main", files, "missing");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("removed") });
});

test("rejects a symlink", () => {
  const result = checkDataPr("agent-trains", "main", [modified(TRAINS)], "symlink");
  expect(result).toEqual({ ok: false, reason: expect.stringContaining("symlink") });
});

test("rejects a pull request with no files", () => {
  expect(checkDataPr("agent-trains", "main", [], "missing")).toEqual({
    ok: false,
    reason: expect.stringContaining("exactly one file"),
  });
});

test("reports a pass as ok and the path", () => {
  expect(report({ ok: true, path: TRAINS })).toBe(`ok ${TRAINS}`);
});

test("reports a crafted file name on one line so it cannot issue a workflow command", () => {
  const crafted = "src/a\n::error::forged\r\n::add-mask::x";
  const result = checkDataPr("agent-trains", "main", [modified(crafted)], "file");
  const line = report(result);
  expect(line).not.toMatch(/[\r\n]/);
  expect(line).toContain("src/a");
});

test("reports a crafted branch name on one line", () => {
  const result = checkDataPr("agent-x\n::warning::forged", "main", [], "missing");
  expect(report(result)).not.toMatch(/[\r\n]/);
});
