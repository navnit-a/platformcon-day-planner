import { expect, test } from "vitest";
import { initials, speakerEntries, speakerPeople } from "./speakers";

test("takes the first and last initial of a name", () => {
  expect(initials("Luca Galante")).toBe("LG");
  expect(initials("Liz Fong-Jones")).toBe("LF");
  expect(initials("Dan Hoban")).toBe("DH");
});

test("uses one initial for a single name and none for an empty one", () => {
  expect(initials("Luca")).toBe("L");
  expect(initials("  ")).toBe("");
});

test("ignores extra spaces and lower case", () => {
  expect(initials("  mai   nishitani ")).toBe("MN");
});

test("splits the speakers line into one entry per speaker", () => {
  expect(speakerEntries("Liz Fong-Jones, honeycomb.io; James Jarvis, ClearRoute")).toEqual([
    "Liz Fong-Jones, honeycomb.io",
    "James Jarvis, ClearRoute",
  ]);
  expect(speakerEntries("")).toEqual([]);
});

test("finds each person in the speakers line, without their company", () => {
  expect(speakerPeople("Luca Galante, Weave Intelligence")).toEqual(["Luca Galante"]);
  expect(speakerPeople("Tom Morelly and Justin Wilkin, ClearRoute")).toEqual([
    "Tom Morelly",
    "Justin Wilkin",
  ]);
  expect(speakerPeople("Liz Fong-Jones, honeycomb.io; James Jarvis, ClearRoute")).toEqual([
    "Liz Fong-Jones",
    "James Jarvis",
  ]);
  expect(speakerPeople("")).toEqual([]);
});
