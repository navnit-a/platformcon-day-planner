export function speakerEntries(speakers: string): string[] {
  return speakers
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function speakerPeople(speakers: string): string[] {
  return speakerEntries(speakers).flatMap((entry) =>
    entry
      .split(",")[0]
      .split(" and ")
      .map((name) => name.trim())
      .filter(Boolean),
  );
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picked.map((word) => word[0].toUpperCase()).join("");
}
