import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { parseLunch, parseTrains } from "./feed";

test("the committed trains feed parses", () => {
  expect(() => parseTrains(JSON.parse(readFileSync("public/data/trains.json", "utf8")))).not.toThrow();
});
test("the committed lunch feed parses with three pinned places", () => {
  expect(parseLunch(JSON.parse(readFileSync("public/data/lunch.json", "utf8"))).picks).toHaveLength(3);
});
